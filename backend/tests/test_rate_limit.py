"""Тесты примитива rate limiting (app/core/rate_limit.py) напрямую, без HTTP —
проверяем именно механику счётчика в Redis: лимит, восстановление по TTL,
независимость ключей."""
from __future__ import annotations

import asyncio
import uuid

import pytest
from fastapi import HTTPException

from app.core.rate_limit import check_rate_limit, consume_once


def _key() -> str:
    return f"test:{uuid.uuid4().hex}"


async def test_requests_under_limit_pass():
    key = _key()
    for _ in range(5):
        await check_rate_limit(key, limit=5, window_seconds=60)  # не должно бросить


async def test_blocks_after_limit_exceeded():
    key = _key()
    for _ in range(3):
        await check_rate_limit(key, limit=3, window_seconds=60)

    with pytest.raises(HTTPException) as exc_info:
        await check_rate_limit(key, limit=3, window_seconds=60)

    assert exc_info.value.status_code == 429
    assert "Retry-After" in exc_info.value.headers


async def test_limit_recovers_after_ttl():
    key = _key()
    for _ in range(2):
        await check_rate_limit(key, limit=2, window_seconds=1)
    with pytest.raises(HTTPException):
        await check_rate_limit(key, limit=2, window_seconds=1)

    await asyncio.sleep(1.3)

    await check_rate_limit(key, limit=2, window_seconds=1)  # окно истекло — снова разрешено


async def test_independent_keys_do_not_interfere():
    """Симулирует два разных IP: у одного лимит исчерпан, у другого — нет."""
    key_a, key_b = _key(), _key()
    for _ in range(3):
        await check_rate_limit(key_a, limit=3, window_seconds=60)
    with pytest.raises(HTTPException):
        await check_rate_limit(key_a, limit=3, window_seconds=60)

    await check_rate_limit(key_b, limit=3, window_seconds=60)  # не должно бросить


async def test_consume_once_is_single_use():
    token = f"tok-{uuid.uuid4().hex}"
    assert await consume_once("test-purpose", token, ttl_seconds=60) is True
    assert await consume_once("test-purpose", token, ttl_seconds=60) is False


async def test_consume_once_different_purposes_are_independent():
    token = f"tok-{uuid.uuid4().hex}"
    assert await consume_once("reset", token, ttl_seconds=60) is True
    # Тот же токен-строка, но другое пространство имён (verify) — не тот же ключ.
    assert await consume_once("verify", token, ttl_seconds=60) is True
