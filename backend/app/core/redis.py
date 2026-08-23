"""Подключение к Redis: один пул на приложение."""
from __future__ import annotations

from functools import lru_cache

import redis.asyncio as aioredis

from app.core.config import settings


@lru_cache
def get_redis() -> aioredis.Redis:
    """Клиент Redis (синглтон). decode_responses — сразу строки, не байты."""
    return aioredis.from_url(settings.redis_url, decode_responses=True)
