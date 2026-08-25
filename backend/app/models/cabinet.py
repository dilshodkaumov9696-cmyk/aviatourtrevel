"""Данные личного кабинета: сохранённые пассажиры и обращения по поездкам."""
from __future__ import annotations

import enum

from sqlalchemy import Date, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class SupportRequestKind(str, enum.Enum):
    REFUND = "refund"
    EXCHANGE = "exchange"
    QUESTION = "question"


class SupportRequestStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"


class ProfilePassenger(Base, TimestampMixin):
    __tablename__ = "profile_passengers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    first_name: Mapped[str] = mapped_column(String(64))
    last_name: Mapped[str] = mapped_column(String(64))
    middle_name: Mapped[str | None] = mapped_column(String(64), nullable=True)
    dob: Mapped[object] = mapped_column(Date)
    gender: Mapped[str | None] = mapped_column(String(8), nullable=True)
    citizenship: Mapped[str] = mapped_column(String(64))
    doc_number: Mapped[str] = mapped_column(String(32))
    doc_expiry: Mapped[object | None] = mapped_column(Date, nullable=True)


class SupportRequest(Base, TimestampMixin):
    __tablename__ = "support_requests"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    kind: Mapped[SupportRequestKind] = mapped_column(Enum(SupportRequestKind, native_enum=False, length=20))
    status: Mapped[SupportRequestStatus] = mapped_column(Enum(SupportRequestStatus, native_enum=False, length=20), default=SupportRequestStatus.OPEN)
    message: Mapped[str] = mapped_column(Text)
    __table_args__ = (Index("ix_support_requests_order_status", "order_id", "status"),)
