"""Абстрактный интерфейс провайдера бронирования.

Любой источник данных (Travelpayouts, Sirena, Amadeus, mock) реализует
этот интерфейс. Это позволяет переключать провайдеров без изменений в
сервисах и API.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date


@dataclass(slots=True)
class FlightSearchQuery:
    origin: str           # IATA код, например "MOW"
    destination: str      # IATA код, например "AER"
    depart_date: date
    return_date: date | None = None
    adults: int = 1
    children: int = 0
    infants: int = 0
    cabin: str = "economy"
    currency: str = "rub"


@dataclass(slots=True)
class FlightOffer:
    provider: str
    price: float
    currency: str
    airline: str
    flight_number: str
    depart_at: str
    arrive_at: str
    duration_minutes: int
    transfers: int
    booking_url: str


class BookingProvider(ABC):
    """Базовый класс провайдера. Реализации в travelpayouts.py, sirena.py и др."""

    name: str

    @abstractmethod
    async def search(self, query: FlightSearchQuery) -> list[FlightOffer]:
        """Поиск рейсов по запросу."""


class ProviderError(Exception):
    """Провайдер недоступен или вернул ошибку (после ретраев)."""
