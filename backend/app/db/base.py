"""Декларативная база SQLAlchemy.

Все модели наследуются отсюда. Alembic импортирует этот модуль, чтобы
собрать метаданные для автогенерации миграций — поэтому здесь же
подтягиваются все модели (см. app/models/__init__.py).
"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Общий предок всех моделей."""


class TimestampMixin:
    """Метки создания и изменения строки. Проставляются на стороне БД."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
