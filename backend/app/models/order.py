"""Заявка на билет и её пассажиры.

Заявка — то, что клиент оформил у нас: маршрут, состав пассажиров, тариф,
выбранный способ оплаты. Пока билеты выписываются на стороне партнёра,
заявка живёт до статуса «оплачено»; когда появится собственная выписка,
сюда же лягут номер брони и статусы от консолидатора — менять схему не
придётся, поля уже заведены.

Внимание: здесь хранятся паспортные данные. Это персональные данные, к
таблице passengers нужен ограниченный доступ, а на проде — шифрование
столбцов с номером документа.
"""
from __future__ import annotations

import enum
import secrets
import string
from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class OrderStatus(str, enum.Enum):
    """Жизненный цикл заявки. Порядок соответствует шкале статусов в /book."""

    NEW = "new"  # Заявка создана
    AWAITING_PAYMENT = "awaiting_payment"  # Ожидает оплаты
    PAID = "paid"  # Оплачено
    ISSUED = "issued"  # Билет выписан
    CANCELLED = "cancelled"  # Отменена

    @property
    def label(self) -> str:
        return {
            OrderStatus.NEW: "Заявка создана",
            OrderStatus.AWAITING_PAYMENT: "Ожидает оплаты",
            OrderStatus.PAID: "Оплачено",
            OrderStatus.ISSUED: "Билет выписан",
            OrderStatus.CANCELLED: "Отменена",
        }[self]


# Из алфавита убраны символы, которые путают при диктовке по телефону:
# 0/O, 1/I, 5/S.
_REF_ALPHABET = "".join(c for c in string.ascii_uppercase + string.digits if c not in "O0I1S5")


def generate_ref() -> str:
    """Короткий код заявки для клиента, вида AV-7K2M9X."""
    return "AV-" + "".join(secrets.choice(_REF_ALPHABET) for _ in range(6))


class Order(Base, TimestampMixin):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # Показываем клиенту его, а не id: по id можно перебирать чужие заявки.
    ref: Mapped[str] = mapped_column(String(16), unique=True, nullable=False, default=generate_ref)

    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, name="order_status", native_enum=False, length=32),
        nullable=False,
        default=OrderStatus.NEW,
    )

    # Пусто для гостевого оформления. Если клиент был залогинен — привязываем,
    # чтобы «Мои заказы» не зависели только от почты.
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    contact_email: Mapped[str] = mapped_column(String(320), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(32), nullable=False)

    # Маршрут
    origin: Mapped[str] = mapped_column(String(3), nullable=False)
    destination: Mapped[str] = mapped_column(String(3), nullable=False)
    depart_date: Mapped[date] = mapped_column(Date, nullable=False)
    return_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    cabin: Mapped[str] = mapped_column(String(16), nullable=False, default="economy")

    # Снимок выбранного рейса на момент заявки. Цена у провайдера меняется,
    # а клиенту мы обязаны показывать ту, на которую он согласился.
    airline: Mapped[str | None] = mapped_column(String(8), nullable=True)
    flight_number: Mapped[str | None] = mapped_column(String(16), nullable=True)
    depart_at: Mapped[str | None] = mapped_column(String(32), nullable=True)
    arrive_at: Mapped[str | None] = mapped_column(String(32), nullable=True)

    tariff: Mapped[str] = mapped_column(String(16), nullable=False, default="standard")
    seat: Mapped[str | None] = mapped_column(String(8), nullable=True)
    promo: Mapped[str | None] = mapped_column(String(32), nullable=True)
    payment_method: Mapped[str] = mapped_column(String(16), nullable=False, default="card")

    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="RUB")

    # Заполнятся, когда выписка станет своей. Сейчас всегда пусты.
    pnr: Mapped[str | None] = mapped_column(String(16), nullable=True)
    ticket_numbers: Mapped[str | None] = mapped_column(String(255), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    issued_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    passengers: Mapped[list["Passenger"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
        lazy="selectin",  # без этого обращение к order.passengers в async-коде упадёт
    )

    __table_args__ = (
        Index("ix_orders_contact_email", "contact_email"),
        Index("ix_orders_status_created", "status", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<Order {self.ref} {self.origin}→{self.destination} {self.status.value}>"


class Passenger(Base, TimestampMixin):
    __tablename__ = "passengers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )

    first_name: Mapped[str] = mapped_column(String(64), nullable=False)
    last_name: Mapped[str] = mapped_column(String(64), nullable=False)
    middle_name: Mapped[str | None] = mapped_column(String(64), nullable=True)
    dob: Mapped[date] = mapped_column(Date, nullable=False)
    gender: Mapped[str] = mapped_column(String(8), nullable=False)
    citizenship: Mapped[str] = mapped_column(String(64), nullable=False)
    doc_number: Mapped[str] = mapped_column(String(32), nullable=False)
    doc_expiry: Mapped[date | None] = mapped_column(Date, nullable=True)

    order: Mapped[Order] = relationship(back_populates="passengers")

    def __repr__(self) -> str:
        return f"<Passenger {self.last_name} {self.first_name}>"
