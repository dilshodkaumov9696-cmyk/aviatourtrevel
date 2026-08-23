"""Асинхронный движок и фабрика сессий SQLAlchemy."""
from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

engine = create_async_engine(
    settings.database_url,
    echo=settings.app_debug,
    pool_pre_ping=True,  # отсекает соединения, разорванные простоем
)

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # объекты остаются читаемыми после commit
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Зависимость FastAPI: сессия на время запроса."""
    async with async_session_maker() as session:
        yield session
