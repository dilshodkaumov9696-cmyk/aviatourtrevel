"""Создание платежа в ЮKassa. Если ключи не заданы — invoice-режим без списания."""
from __future__ import annotations

import logging
import uuid
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

YOOKASSA_PAYMENTS_URL = "https://api.yookassa.ru/v3/payments"


async def create_yookassa_payment(
    *,
    amount: float,
    currency: str,
    description: str,
    return_url: str,
    metadata: dict[str, str],
) -> dict[str, Any] | None:
    """Возвращает JSON платежа ЮKassa или None, если шлюз не настроен."""
    if not settings.yookassa_shop_id or not settings.yookassa_secret_key:
        return None

    payload = {
        "amount": {"value": f"{amount:.2f}", "currency": currency.upper()},
        "capture": True,
        "confirmation": {"type": "redirect", "return_url": return_url},
        "description": description[:128],
        "metadata": metadata,
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            YOOKASSA_PAYMENTS_URL,
            json=payload,
            auth=(settings.yookassa_shop_id, settings.yookassa_secret_key),
            headers={"Idempotence-Key": str(uuid.uuid4()), "Content-Type": "application/json"},
        )
        resp.raise_for_status()
        data = resp.json()
        logger.info("YooKassa payment created id=%s status=%s", data.get("id"), data.get("status"))
        return data
