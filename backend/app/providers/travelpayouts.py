"""Провайдер Travelpayouts/Aviasales — кэшированный Data API (prices_for_dates).

Возвращает кэшированные цены Aviasales. Для live-цен потребуется поисковый
API (требует 50k+ MAU) или консолидатор — провайдер подменяется без изменений
в API/сервисах (см. app.providers.base.BookingProvider).
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timedelta

import httpx  # pyright: ignore[reportMissingImports]

from app.providers.base import (
    BookingProvider,
    FlightOffer,
    FlightSearchQuery,
    ProviderError,
)

PRICES_URL = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"
AVIASALES_BASE = "https://www.aviasales.com"

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

        resp = await client.get(PRICES_URL, params=params)
        resp.raise_for_status()
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
        return FlightOffer(
            provider=self.name,
            price=float(item.get("price", 0)),
            currency=currency.upper(),
            airline=airline,
            flight_number=f"{airline}{flight_no}" if flight_no else "—",
            depart_at=depart_at,
            arrive_at=self._add_minutes(depart_at, duration),
            duration_minutes=duration,
            transfers=int(item.get("transfers", 0)),
            booking_url=self._booking_url(item.get("link") or ""),
        )

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
