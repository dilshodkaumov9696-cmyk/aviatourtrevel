from dataclasses import asdict
from datetime import date

from fastapi import APIRouter, HTTPException, Query  # pyright: ignore[reportMissingImports]

from app.providers import get_provider
from app.providers.base import FlightSearchQuery, ProviderError
from app.services import search_cache

router = APIRouter()


@router.get("/search")
async def search_flights(
    origin: str = Query(..., min_length=3, max_length=3, description="IATA код вылета, напр. MOW"),
    destination: str = Query(..., min_length=3, max_length=3, description="IATA код прилёта, напр. AER"),
    depart_date: date = Query(..., description="Дата вылета YYYY-MM-DD"),
    return_date: date | None = Query(None, description="Дата возврата (опционально)"),
    adults: int = Query(1, ge=1, le=9, description="Взрослых пассажиров"),
    children: int = Query(0, ge=0, le=8, description="Детей (2–11 лет)"),
    infants: int = Query(0, ge=0, le=8, description="Младенцев без места"),
    cabin: str = Query("economy", min_length=3, max_length=16, description="Класс: economy/business/first"),
    currency: str = Query("rub", min_length=3, max_length=3, description="Валюта цен"),
) -> dict:
    """Поиск авиабилетов через активного провайдера (сейчас — Travelpayouts data API)."""
    if infants > adults:
        raise HTTPException(status_code=422, detail="Младенцев не может быть больше, чем взрослых")
    provider = get_provider()
    query = FlightSearchQuery(
        origin=origin,
        destination=destination,
        depart_date=depart_date,
        return_date=return_date,
        adults=adults,
        children=children,
        infants=infants,
        cabin=cabin.lower(),
        currency=currency,
    )
    offers = await search_cache.get_cached(query)
    cached = offers is not None

    if not cached:
        try:
            offers = await provider.search(query)
        except ProviderError as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc
        await search_cache.set_cached(query, offers)

    return {
        "provider": provider.name,
        "currency": currency.upper(),
        "cached": cached,
        "count": len(offers),
        "adults": adults,
        "children": children,
        "infants": infants,
        "cabin": cabin.lower(),
        "offers": [asdict(offer) for offer in offers],
        "price_note": "Цена оффера — за одного взрослого (как отдаёт Data API). Итог на клиента считается на фронте по числу мест.",
    }


@router.get("/search/calendar")
async def search_calendar(
    origin: str = Query(..., min_length=3, max_length=3),
    destination: str = Query(..., min_length=3, max_length=3),
    month: str = Query(..., min_length=7, max_length=7, description="YYYY-MM"),
) -> dict:
    """Цены по дням месяца для календаря — тот же Travelpayouts-токен, что и поиск."""
    provider = get_provider()
    calendar = getattr(provider, "calendar_prices", None)
    if calendar is None:
        return {"prices": {}}
    try:
        prices = await calendar(origin.upper(), destination.upper(), month)
    except ProviderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return {"prices": prices}
