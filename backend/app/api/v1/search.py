from dataclasses import asdict
from datetime import date

from fastapi import APIRouter, HTTPException, Query  # pyright: ignore[reportMissingImports]

from app.providers import get_provider
from app.providers.base import FlightSearchQuery, ProviderError

router = APIRouter()


@router.get("/search")
async def search_flights(
    origin: str = Query(..., min_length=3, max_length=3, description="IATA код вылета, напр. MOW"),
    destination: str = Query(..., min_length=3, max_length=3, description="IATA код прилёта, напр. AER"),
    depart_date: date = Query(..., description="Дата вылета YYYY-MM-DD"),
    return_date: date | None = Query(None, description="Дата возврата (опционально)"),
    adults: int = Query(1, ge=1, le=9, description="Взрослых пассажиров"),
    currency: str = Query("rub", min_length=3, max_length=3, description="Валюта цен"),
) -> dict:
    """Поиск авиабилетов через активного провайдера (сейчас — Travelpayouts data API)."""
    provider = get_provider()
    query = FlightSearchQuery(
        origin=origin,
        destination=destination,
        depart_date=depart_date,
        return_date=return_date,
        adults=adults,
        currency=currency,
    )
    try:
        offers = await provider.search(query)
    except ProviderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {
        "provider": provider.name,
        "currency": currency.upper(),
        "count": len(offers),
        "offers": [asdict(offer) for offer in offers],
    }
