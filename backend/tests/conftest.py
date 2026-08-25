"""Общие фикстуры для тестов.

Гоняем против реального dev Redis/Postgres (отдельной test-инфраструктуры в
проекте нет) — тестовые данные помечены префиксом pytest- в email и чистятся
после каждого теста, чтобы не засорять базу и не пересекаться с dev-трафиком.

Вся сессия работает на одном event loop (см. asyncio_default_test_loop_scope
в pyproject.toml) — движок SQLAlchemy и клиент Redis в приложении оба созданы
как модульные синглтоны один раз при импорте, и per-test loop их бы ломал.
"""
from __future__ import annotations

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete

from app.core.redis import get_redis
from app.db.session import async_session_maker
from app.main import app
from app.models.user import User

TEST_EMAIL_PREFIX = "pytest-"


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


@pytest_asyncio.fixture(autouse=True)
async def _cleanup():
    """После каждого теста удаляем тестовых пользователей и rate-limit/token
    ключи в Redis, которые могли быть выставлены тестом."""
    yield

    async with async_session_maker() as session:
        await session.execute(delete(User).where(User.email.like(f"{TEST_EMAIL_PREFIX}%")))
        await session.commit()

    redis = get_redis()
    for pattern in ("rl:*", "used-token:*"):
        async for key in redis.scan_iter(match=pattern):
            await redis.delete(key)
