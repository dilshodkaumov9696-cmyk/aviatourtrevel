"""Подписка на цену: следим за маршрутом и пишем, когда стало дешевле."""
from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Index, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class PriceAlert(Base, TimestampMixin):
    """Одна подписка пользователя на цену конкретного маршрута.

    Пользователь указывает маршрут, дату и порог. Воркер периодически
    опрашивает провайдера и, когда цена опускается не выше порога,
    отправляет письмо и помечает подписку сработавшей.
    """

    __tablename__ = "price_alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    email: Mapped[str] = mapped_column(String(320), nullable=False)

    origin: Mapped[str] = mapped_column(String(3), nullable=False)
    destination: Mapped[str] = mapped_column(String(3), nullable=False)
    depart_date: Mapped[date] = mapped_column(Date, nullable=False)
    return_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    cabin: Mapped[str] = mapped_column(String(16), nullable=False, default="economy")
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="RUB")

    # Порог: уведомляем, когда цена стала не выше этого значения.
    target_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    # Последняя увиденная воркером цена — чтобы не слать письмо на каждой проверке.
    last_seen_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    notified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_checked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        # Воркер выбирает активные подписки, отсортированные по давности проверки.
        Index("ix_price_alerts_active_checked", "is_active", "last_checked_at"),
        # Быстрый поиск подписок конкретного человека.
        Index("ix_price_alerts_email", "email"),
    )

    def __repr__(self) -> str:
        return (
            f"<PriceAlert {self.origin}→{self.destination} {self.depart_date} "
            f"≤{self.target_price} {self.currency} для {self.email}>"
        )
