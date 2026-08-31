"""Пользователь личного кабинета.

Пароль есть не у всех: если человек вошёл только через Google,
hashed_password остаётся пустым — учётка существует, но локальный
вход по паролю для неё не работает.
"""
from __future__ import annotations

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    full_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    google_id: Mapped[str | None] = mapped_column(String(64), unique=True, index=True, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    # Подтверждён владельцем письмом со ссылкой, либо доказан через Google OAuth.
    # Пока не True — гостевые заявки по совпадению email НЕ привязываются к
    # аккаунту (см. _claim_orders в cabinet.py): иначе зарегистрировавшись на
    # чужой email можно было бы увидеть чужие заявки и подписки на цену.
    email_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    # Сотрудник бэк-офиса: доступ к /admin без X-Manager-Key, по cookie-сессии.
    is_staff: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    def __repr__(self) -> str:
        return f"<User {self.email}>"
