"""Anti-abuse для auth-эндпоинтов: счётчики попыток и одноразовые токены в Redis.

Используем тот же Redis, что и поиск (app/services/search_cache.py) — отдельной
инфраструктуры под rate limiting не заводим. Fixed window (INCR + EXPIRE) —
проще sliding window/токен-бакета, не идеально точен на границе окна, но для
защиты от подбора/спама этого достаточно.

Fail open: если Redis недоступен, лимитер логирует предупреждение и пропускает
запрос, а не роняет login/регистрацию целиком. Deliberate trade-off — доступность
обычного входа важнее лимитов в момент сбоя инфраструктуры.
"""
from __future__ import annotations

import hashlib
import logging

from fastapi import HTTPException, Request  # pyright: ignore[reportMissingImports]
from redis.exceptions import RedisError

from app.core.config import settings
from app.core.redis import get_redis

logger = logging.getLogger(__name__)


def client_ip(request: Request) -> str:
    """IP клиента. X-Forwarded-For учитываем на случай прод-деплоя за прокси/LB —
    в текущем dev-окружении заголовка нет, используется request.client.host."""
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def check_rate_limit(key: str, limit: int, window_seconds: int) -> None:
    """Инкрементирует счётчик key; бросает 429, если он превысил limit за window_seconds."""
    if not settings.auth_rate_limit_enabled:
        return
    redis = get_redis()
    try:
        count = await redis.incr(key)
        if count == 1:
            await redis.expire(key, window_seconds)
        ttl = await redis.ttl(key) if count > limit else 0
    except RedisError:
        logger.warning("Redis недоступен для rate limit %s — пропускаю проверку (fail open)", key)
        return

    if count > limit:
        raise HTTPException(
            status_code=429,
            detail="Слишком много попыток. Повторите позже.",
            headers={"Retry-After": str(max(ttl, 1))},
        )


async def enforce(
    request: Request, scope: str, limit: int, window_seconds: int, identifier: str | None = None,
) -> None:
    """Лимит по IP и, если передан identifier (email и т.п.), отдельно по нему —
    оба измерения из одного вызова, чтобы не дублировать код в каждом эндпоинте."""
    await check_rate_limit(f"rl:{scope}:ip:{client_ip(request)}", limit, window_seconds)
    if identifier:
        await check_rate_limit(f"rl:{scope}:id:{identifier.strip().lower()}", limit, window_seconds)


def _token_fingerprint(token: str) -> str:
    """Не храним сам токен в Redis (это секрет) — только его отпечаток."""
    return hashlib.sha256(token.encode()).hexdigest()


async def consume_once(purpose: str, token: str, ttl_seconds: int) -> bool:
    """Атомарно помечает токен использованным. True — можно применять (первое
    использование), False — токен уже был предъявлен (повтор по старой ссылке).

    Fail-open здесь означало бы "разрешить повторное использование токена при
    сбое Redis" — это ослабляет, а не усиливает защиту, поэтому при недоступности
    Redis отклоняем: лучше временно не дать сбросить пароль, чем разрешить replay.
    """
    redis = get_redis()
    key = f"used-token:{purpose}:{_token_fingerprint(token)}"
    try:
        first_use = await redis.set(key, "1", nx=True, ex=ttl_seconds)
    except RedisError:
        logger.warning("Redis недоступен для токена %s — отклоняю по умолчанию", purpose)
        return False
    return bool(first_use)
