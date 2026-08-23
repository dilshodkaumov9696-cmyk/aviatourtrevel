"""Воркер ценовых подписок.

Периодически берёт пачку активных подписок, спрашивает у провайдера
минимальную цену по маршруту и, если она опустилась до порога, шлёт письмо
и гасит подписку.

Запросы идут через тот же кэш, что и обычный поиск, — иначе воркер
быстро упрётся в лимиты Travelpayouts.
"""
from __future__ import annotations

import asyncio
import logging
from datetime import UTC, date, datetime

from sqlalchemy import select

from app.core.config import settings
from app.db.session import async_session_maker
from app.models.price_alert import PriceAlert
from app.providers import get_provider
from app.providers.base import FlightSearchQuery, ProviderError
from app.services import search_cache
from app.services.mailer import send_email

logger = logging.getLogger(__name__)


async def _min_price(alert: PriceAlert) -> float | None:
    """Минимальная цена по маршруту подписки. None — провайдер не ответил."""
    query = FlightSearchQuery(
        origin=alert.origin,
        destination=alert.destination,
        depart_date=alert.depart_date,
        return_date=alert.return_date,
        cabin=alert.cabin,
        currency=alert.currency.lower(),
    )

    offers = await search_cache.get_cached(query)
    if offers is None:
        try:
            offers = await get_provider().search(query)
        except ProviderError as exc:
            logger.warning("Провайдер не ответил по подписке %s: %s", alert.id, exc)
            return None
        await search_cache.set_cached(query, offers)

    return min((o.price for o in offers), default=None)


def _money(value: float) -> str:
    """13582 → «13 582». Пробел неразрывный, чтобы число не рвалось по строкам."""
    return f"{value:,.0f}".replace(",", " ")


def _letter(alert: PriceAlert, price: float) -> tuple[str, str]:
    """Тема и текст письма о снижении цены."""
    route = f"{alert.origin} → {alert.destination}"
    subject = f"Цена упала: {route} за {_money(price)} {alert.currency}"
    link = (
        f"{settings.site_url}/search?fromIata={alert.origin}&toIata={alert.destination}"
        f"&date={alert.depart_date.isoformat()}"
    )
    if alert.return_date:
        link += f"&returnDate={alert.return_date.isoformat()}"

    body = (
        f"Здравствуйте!\n\n"
        f"Цена на {route} ({alert.depart_date:%d.%m.%Y}) опустилась до "
        f"{_money(price)} {alert.currency} — это не выше вашего порога "
        f"{_money(float(alert.target_price))} {alert.currency}.\n\n"
        f"Посмотреть рейсы: {link}\n\n"
        f"Подписка выполнена и больше не отслеживается. "
        f"Чтобы следить дальше, оформите её заново на сайте.\n"
    )
    return subject, body


async def check_once() -> int:
    """Один проход по пачке подписок. Возвращает число отправленных писем."""
    sent = 0
    async with async_session_maker() as session:
        alerts = list(
            await session.scalars(
                select(PriceAlert)
                .where(
                    PriceAlert.is_active.is_(True),
                    # Прошедшие даты больше не отслеживаем.
                    PriceAlert.depart_date >= date.today(),
                )
                # NULLS FIRST: ни разу не проверенные идут первыми.
                .order_by(PriceAlert.last_checked_at.asc().nulls_first())
                .limit(settings.price_watch_batch)
            )
        )

        for alert in alerts:
            price = await _min_price(alert)
            alert.last_checked_at = datetime.now(UTC)

            if price is None:
                continue

            alert.last_seen_price = price

            if price <= float(alert.target_price):
                subject, body = _letter(alert, price)
                await send_email(alert.email, subject, body)
                alert.notified_at = datetime.now(UTC)
                # Гасим, чтобы не слать письмо на каждом проходе.
                alert.is_active = False
                sent += 1

        # Подписки с прошедшей датой вылета отключаем, чтобы не копились.
        stale = await session.scalars(
            select(PriceAlert).where(
                PriceAlert.is_active.is_(True), PriceAlert.depart_date < date.today()
            )
        )
        for alert in stale:
            alert.is_active = False

        await session.commit()

    logger.info("Проверено подписок: %d, отправлено писем: %d", len(alerts), sent)
    return sent


async def run_forever() -> None:
    """Бесконечный цикл. Падение одного прохода не должно ронять воркер."""
    logger.info("Воркер ценовых подписок запущен, интервал %d с", settings.price_watch_interval_seconds)
    while True:
        try:
            await check_once()
        except Exception:  # noqa: BLE001 — иначе одна ошибка убьёт воркер навсегда
            logger.exception("Проход ценового воркера завершился ошибкой")
        await asyncio.sleep(settings.price_watch_interval_seconds)


if __name__ == "__main__":
    from app.core.logging import setup_logging

    setup_logging()
    asyncio.run(run_forever())
