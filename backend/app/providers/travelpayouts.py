"""Провайдер Travelpayouts/Aviasales — кэшированный Data API (prices_for_dates).

Возвращает кэшированные цены Aviasales. Для live-цен потребуется поисковый
API (требует 50k+ MAU) или консолидатор — провайдер подменяется без изменений
в API/сервисах (см. app.providers.base.BookingProvider).
"""
from __future__ import annotations

import asyncio
import logging
import re
import urllib.parse
from datetime import datetime, timedelta

import httpx  # pyright: ignore[reportMissingImports]

from app.providers.base import (
    BookingProvider,
    FlightOffer,
    FlightSearchQuery,
    ProviderError,
)

logger = logging.getLogger(__name__)

PRICES_URL = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"
AVIASALES_BASE = "https://www.aviasales.com"

# Повторы на сетевых сбоях: задержки 0.5 с и 1 с. Больше ждать нельзя —
# запрос идёт синхронно в ответ пользователю.
RETRY_ATTEMPTS = 3
RETRY_BASE_DELAY = 0.5

# Город/аэропорты одной агломерации — маршрут «внутри города» бессмыслен.
_SAME_CITY_GROUPS = (
    {"MOW", "DME", "SVO", "VKO", "ZIA", "BKA"},
    {"IST", "SAW"},
    {"LON", "LHR", "LGW", "STN", "LTN", "LCY", "SEN"},
    {"PAR", "CDG", "ORY", "BVA"},
    {"NYC", "JFK", "EWR", "LGA"},
    {"TYO", "NRT", "HND"},
)

# Разные срезы выдачи v3 (отдаёт один билет на день) → больше уникальных вариантов.
_QUERY_VARIANTS = (
    {"direct": "true", "sorting": "price"},
    {"direct": "false", "sorting": "price"},
    {"direct": "false", "sorting": "route"},
)


class TravelpayoutsProvider(BookingProvider):
    name = "travelpayouts"

    def __init__(self, token: str, marker: str, *, timeout: float = 8.0, limit: int = 30):
        self._token = token
        self._marker = marker
        self._timeout = timeout
        self._limit = limit

    async def search(self, query: FlightSearchQuery) -> list[FlightOffer]:
        origin = (query.origin or "").strip().upper()
        destination = (query.destination or "").strip().upper()
        if not origin or not destination or self._is_same_city(origin, destination):
            return []
        if not self._token:
            return []

        depart = query.depart_date.isoformat()
        return_at = query.return_date.isoformat() if query.return_date else None
        currency = (query.currency or "rub").lower()

        async with httpx.AsyncClient(timeout=self._timeout) as client:
            tasks = [
                self._fetch(client, origin, destination, depart, return_at, currency, extra)
                for extra in _QUERY_VARIANTS
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)

        ok_lists = [r for r in results if not isinstance(r, BaseException)]
        if not ok_lists:
            errors = [r for r in results if isinstance(r, BaseException)]
            raise ProviderError(f"travelpayouts недоступен: {errors[0]}") from errors[0]

        offers: list[FlightOffer] = []
        seen: set[tuple] = set()
        for sub in ok_lists:
            for offer in sub:
                key = (offer.airline, offer.flight_number, offer.depart_at, round(offer.price))
                if key in seen:
                    continue
                seen.add(key)
                offers.append(offer)

        offers.sort(key=lambda o: o.price)
        return offers

    async def _get_with_retry(self, client: httpx.AsyncClient, params: dict) -> httpx.Response:
        """GET с повтором на сетевых сбоях и 5xx.

        В логах ловились ConnectTimeout к Travelpayouts: одиночный таймаут
        ронял весь поиск, хотя следующая попытка проходила. Повторяем только
        то, что имеет шанс починиться само — таймауты, обрывы и ошибки на
        стороне провайдера. На 4xx (плохой запрос, исчерпан лимит) повтор
        бессмысленен, отдаём ошибку сразу.
        """
        last: Exception | None = None
        for attempt in range(RETRY_ATTEMPTS):
            try:
                resp = await client.get(PRICES_URL, params=params)
                resp.raise_for_status()
                return resp
            except (httpx.TransportError, httpx.HTTPStatusError) as exc:
                # 4xx не повторяем — сам по себе не исправится.
                if isinstance(exc, httpx.HTTPStatusError) and exc.response.status_code < 500:
                    raise
                last = exc
                if attempt < RETRY_ATTEMPTS - 1:
                    delay = RETRY_BASE_DELAY * (2**attempt)
                    logger.warning(
                        "Travelpayouts не ответил (попытка %d/%d): %s. Повтор через %.1f с",
                        attempt + 1, RETRY_ATTEMPTS, type(exc).__name__, delay,
                    )
                    await asyncio.sleep(delay)

        raise ProviderError(f"travelpayouts не ответил за {RETRY_ATTEMPTS} попытки: {last}") from last

    async def _fetch(
        self,
        client: httpx.AsyncClient,
        origin: str,
        destination: str,
        depart: str,
        return_at: str | None,
        currency: str,
        extra: dict,
    ) -> list[FlightOffer]:
        params = {
            "origin": origin,
            "destination": destination,
            "departure_at": depart,
            "one_way": "false" if return_at else "true",
            "currency": currency,
            "limit": self._limit,
            "token": self._token,
            **extra,
        }
        if return_at:
            params["return_at"] = return_at

        resp = await self._get_with_retry(client, params)
        data = resp.json()
        if not data.get("success"):
            raise ProviderError(f"success=false: {data.get('error') or data}")

        items = data.get("data") or []
        if isinstance(items, dict):
            items = list(items.values())

        return [
            self._to_offer(item, currency)
            for item in items
            if isinstance(item, dict)
        ]

    def _to_offer(self, item: dict, currency: str) -> FlightOffer:
        dep_raw = item.get("departure_at") or ""
        depart_at = dep_raw if "T" in dep_raw else f"{dep_raw}T00:00:00"
        duration = int(item.get("duration_to") or item.get("duration") or 0)
        airline = item.get("airline") or "—"
        flight_no = item.get("flight_number")
        link = item.get("link") or ""
        origin_airport = item.get("origin_airport") or item.get("origin") or ""
        dest_airport = item.get("destination_airport") or item.get("destination") or ""
        transfers = int(item.get("transfers", 0))
        stop_airports = self._parse_stop_airports(link, origin_airport, dest_airport) if transfers > 0 else []
        return FlightOffer(
            provider=self.name,
            price=float(item.get("price", 0)),
            currency=currency.upper(),
            airline=airline,
            flight_number=f"{airline}{flight_no}" if flight_no else "—",
            depart_at=depart_at,
            arrive_at=self._add_minutes(depart_at, duration),
            duration_minutes=duration,
            transfers=transfers,
            booking_url=self._booking_url(link),
            stop_airports=stop_airports,
        )

    @staticmethod
    def _parse_stop_airports(link: str, origin: str, destination: str) -> list[str]:
        """Извлекает IATA-коды промежуточных аэропортов из параметра t= в ссылке Aviasales.

        Формат t=: {airline}{timestamp_dep}{timestamp_arr}{pad}{dur}{IATA...}_{hash}_{price}
        Пример: SZ17826252001782708900001515DYUTBSSAW_abc123_24280
        Маршрут кодируется как последовательные 3-буквенные IATA-коды в конце первого сегмента.
        """
        try:
            qs = urllib.parse.urlparse(link).query
            params = urllib.parse.parse_qs(qs)
            t_vals = params.get("t", [])
            if not t_vals:
                return []
            t_segment = t_vals[0].split("_")[0]  # часть до первого подчёркивания
            # Ищем блок IATA-кодов в конце (один или более 3-буквенных групп заглавных букв)
            m = re.search(r"([A-Z]{3})+$", t_segment)
            if not m:
                return []
            iata_block = m.group(0)
            iatas = [iata_block[i:i + 3] for i in range(0, len(iata_block), 3)]
            # Удаляем первый (origin) и последний (destination) аэропорты
            if iatas and iatas[0] == origin:
                iatas = iatas[1:]
            if iatas and iatas[-1] == destination:
                iatas = iatas[:-1]
            return iatas
        except Exception:
            return []

    def _booking_url(self, link: str) -> str:
        if not link:
            return ""
        url = f"{AVIASALES_BASE}{link}"
        if self._marker:
            url += ("&" if "?" in link else "?") + f"marker={self._marker}"
        return url

    @staticmethod
    def _add_minutes(iso: str, minutes: int) -> str:
        try:
            dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
            return (dt + timedelta(minutes=minutes)).isoformat()
        except ValueError:
            return iso

    @staticmethod
    def _is_same_city(origin: str, destination: str) -> bool:
        if origin == destination:
            return True
        return any(origin in g and destination in g for g in _SAME_CITY_GROUPS)
