"""Модели БД.

Импорт здесь обязателен: Alembic смотрит на Base.metadata, а метаданные
наполняются только теми моделями, чьи модули были импортированы.
"""
from app.db.base import Base
from app.models.order import Order, OrderStatus, Passenger
from app.models.price_alert import PriceAlert
from app.models.user import User
from app.models.cabinet import ProfilePassenger, SupportRequest, SupportRequestKind, SupportRequestStatus

__all__ = ["Base", "Order", "OrderStatus", "Passenger", "PriceAlert", "User", "ProfilePassenger", "SupportRequest", "SupportRequestKind", "SupportRequestStatus"]
