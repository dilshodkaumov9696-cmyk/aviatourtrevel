"""Кэш результатов поиска в Redis.

Зачем: у Travelpayouts есть лимиты на запросы, а один и тот же маршрут
на ту же дату запрашивают многократно — и посетители, и воркер ценовых
подписок. Без кэша воркер быстро упрётся в лимит.

Ошибки Redis намеренно проглатываются: недоступный кэш не должен ронять
поиск, он лишь перестаёт ускорять.
"""
from __future__ import annotations

import json
import logging
from dataclasses import asdict

from app.core.redis import get_redis
from app.providers.base import FlightOffer, FlightSearchQuery

logger = logging.getLogger(__name__)

# Цены живут недолго, но и не мгновение: полчаса — компромисс между
# свежестью выдачи и нагрузкой на провайдера.
CACHE_TTL_SECONDS = 30 * 60


def cache_key(query: FlightSearchQuery) -> str:
    """Ключ кэша. Всё, что влияет на выдачу, входит в ключ."""
    parts = [
        query.origin.upper(),
        query.destination.upper(),
        query.depart_date.isoformat(),
        query.return_date.isoformat() if query.return_date else "-",
        query.cabin,
        query.currency.lower(),
        str(query.adults),
        str(query.children),
        str(query.infants),
    ]
    return "search:" + ":".join(parts)


async def get_cached(query: FlightSearchQuery) -> list[FlightOffer] | None:
    """Достаёт выдачу из кэша. None — промах или Redis недоступен."""
    try:
        raw = await get_redis().get(cache_key(query))
    except Exception as exc:  # noqa: BLE001 — кэш не критичен, живём дальше
        logger.warning("Redis недоступен при чтении кэша: %s", exc)
        return None

    if not raw:
        return None

    try:
        return [FlightOffer(**item) for item in json.loads(raw)]
    except (json.JSONDecodeError, TypeError) as exc:
        # Формат FlightOffer изменился, а в кэше лежит старый — игнорируем.
        logger.warning("Битая запись в кэше поиска, пропускаем: %s", exc)
        return None


async def set_cached(query: FlightSearchQuery, offers: list[FlightOffer]) -> None:
    """Кладёт выдачу в кэш. Пустой результат не кэшируем."""
    if not offers:
        return

    try:
        await get_redis().set(
            cache_key(query),
            json.dumps([asdict(offer) for offer in offers], ensure_ascii=False),
            ex=CACHE_TTL_SECONDS,
        )
    except Exception as exc:  # noqa: BLE001 — не смогли закэшировать, не беда
        logger.warning("Redis недоступен при записи кэша: %s", exc)
