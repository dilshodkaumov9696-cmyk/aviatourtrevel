"""Подписки на цену: создать, посмотреть свои, отписаться."""
from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query  # pyright: ignore[reportMissingImports]
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.price_alert import PriceAlert

router = APIRouter()

CABINS = {"economy", "business", "first"}


class PriceAlertCreate(BaseModel):
    email: EmailStr
    origin: str = Field(..., min_length=3, max_length=3)
    destination: str = Field(..., min_length=3, max_length=3)
    depart_date: date
    return_date: date | None = None
    target_price: float = Field(..., gt=0, le=10_000_000)
    cabin: str = "economy"
    currency: str = Field("RUB", min_length=3, max_length=3)

    @field_validator("origin", "destination")
    @classmethod
    def upper_iata(cls, v: str) -> str:
        return v.upper()

    @field_validator("cabin")
    @classmethod
    def known_cabin(cls, v: str) -> str:
        if v not in CABINS:
            raise ValueError(f"Неизвестный класс: {v!r}. Допустимо: {', '.join(sorted(CABINS))}")
        return v

    @field_validator("currency")
    @classmethod
    def upper_currency(cls, v: str) -> str:
        return v.upper()


class PriceAlertOut(BaseModel):
    id: int
    email: EmailStr
    origin: str
    destination: str
    depart_date: date
    return_date: date | None
    target_price: float
    last_seen_price: float | None
    cabin: str
    currency: str
    is_active: bool

    model_config = {"from_attributes": True}


@router.post("/alerts", response_model=PriceAlertOut, status_code=201)
async def create_alert(
    payload: PriceAlertCreate,
    session: AsyncSession = Depends(get_session),
) -> PriceAlert:
    """Подписаться на цену маршрута.

    Повторная подписка на тот же маршрут тем же адресом не плодит дубли —
    обновляется порог у существующей записи и она снова становится активной.
    """
    if payload.origin == payload.destination:
        raise HTTPException(status_code=422, detail="Города вылета и прилёта совпадают")
    if payload.return_date and payload.return_date < payload.depart_date:
        raise HTTPException(status_code=422, detail="Дата возврата раньше даты вылета")

    # is_() вместо == для NULL: в SQL «return_date = NULL» не совпадает ни с чем.
    same_return = (
        PriceAlert.return_date.is_(None)
        if payload.return_date is None
        else PriceAlert.return_date == payload.return_date
    )
    existing = await session.scalar(
        select(PriceAlert).where(
            PriceAlert.email == payload.email,
            PriceAlert.origin == payload.origin,
            PriceAlert.destination == payload.destination,
            PriceAlert.depart_date == payload.depart_date,
            same_return,
            PriceAlert.cabin == payload.cabin,
        )
    )

    if existing:
        existing.target_price = payload.target_price
        existing.currency = payload.currency
        existing.is_active = True
        existing.notified_at = None
        alert = existing
    else:
        alert = PriceAlert(**payload.model_dump())
        session.add(alert)

    await session.commit()
    await session.refresh(alert)
    return alert


@router.get("/alerts", response_model=list[PriceAlertOut])
async def list_alerts(
    email: EmailStr = Query(..., description="Чьи подписки показать"),
    session: AsyncSession = Depends(get_session),
) -> list[PriceAlert]:
    """Активные подписки указанного адреса."""
    result = await session.scalars(
        select(PriceAlert)
        .where(PriceAlert.email == email, PriceAlert.is_active.is_(True))
        .order_by(PriceAlert.created_at.desc())
    )
    return list(result)


@router.delete("/alerts/{alert_id}", status_code=204)
async def delete_alert(
    alert_id: int,
    email: EmailStr = Query(..., description="Подтверждение владельца подписки"),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Отписаться.

    Email в параметрах — чтобы по одному лишь id нельзя было отписать чужого.
    Полноценная защита появится вместе с авторизацией.
    """
    alert = await session.get(PriceAlert, alert_id)
    if alert is None or alert.email != email:
        raise HTTPException(status_code=404, detail="Подписка не найдена")

    alert.is_active = False
    await session.commit()
