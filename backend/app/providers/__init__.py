"""Фабрика провайдеров бронирования: выбор реализации по settings.provider."""
from __future__ import annotations

from functools import lru_cache

from app.core.config import settings
from app.providers.base import BookingProvider
from app.providers.travelpayouts import TravelpayoutsProvider


@lru_cache
def get_provider() -> BookingProvider:
    """Возвращает активный провайдер (синглтон) согласно PROVIDER в .env."""
    if settings.provider == "travelpayouts":
        return TravelpayoutsProvider(
            token=settings.travelpayouts_token,
            marker=settings.travelpayouts_marker,
        )
    raise ValueError(f"Неизвестный провайдер: {settings.provider!r}")
