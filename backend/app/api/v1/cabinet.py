"""Авторизованный API личного кабинета."""
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_session
from app.models.cabinet import ProfilePassenger, SupportRequest, SupportRequestKind, SupportRequestStatus
from app.models.order import Order
from app.models.price_alert import PriceAlert
from app.models.user import User
from app.services.mailer import send_email

router = APIRouter()

class SavedPassengerIn(BaseModel):
    first_name: str = Field(min_length=1, max_length=64); last_name: str = Field(min_length=1, max_length=64)
    middle_name: str | None = None; dob: date; citizenship: str = Field(min_length=1, max_length=64)
    doc_number: str = Field(min_length=4, max_length=32); doc_expiry: date | None = None
class SavedPassengerOut(SavedPassengerIn):
    id: int
    model_config = {"from_attributes": True}
class SupportIn(BaseModel):
    kind: SupportRequestKind; message: str = Field(min_length=8, max_length=2000)
class SupportOut(BaseModel):
    id: int; kind: SupportRequestKind; status: SupportRequestStatus; message: str
    model_config = {"from_attributes": True}

async def _claim_orders(session: AsyncSession, user: User) -> None:
    await session.execute(update(Order).where(Order.user_id.is_(None), Order.contact_email == user.email).values(user_id=user.id))
    await session.commit()

@router.get("/cabinet/orders")
async def my_orders(user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)) -> list[dict]:
    await _claim_orders(session, user)
    orders = await session.scalars(select(Order).where(Order.user_id == user.id).order_by(Order.depart_date.asc()))
    return [{"ref": o.ref, "status": o.status.value, "status_label": o.status.label, "origin": o.origin, "destination": o.destination, "depart_date": o.depart_date, "return_date": o.return_date, "airline": o.airline, "flight_number": o.flight_number, "total_amount": float(o.total_amount), "currency": o.currency, "pnr": o.pnr, "passengers": len(o.passengers), "tariff": o.tariff} for o in orders]

@router.get("/cabinet/orders/{ref}")
async def my_order(ref: str, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)) -> dict:
    await _claim_orders(session, user)
    order = await session.scalar(select(Order).where(Order.ref == ref.upper(), Order.user_id == user.id))
    if not order: raise HTTPException(404, "Поездка не найдена")
    return {"ref": order.ref, "status": order.status.value, "status_label": order.status.label, "origin": order.origin, "destination": order.destination, "depart_date": order.depart_date, "return_date": order.return_date, "airline": order.airline, "flight_number": order.flight_number, "depart_at": order.depart_at, "arrive_at": order.arrive_at, "tariff": order.tariff, "seat": order.seat, "total_amount": float(order.total_amount), "currency": order.currency, "pnr": order.pnr, "passengers": [{"name": f"{p.last_name} {p.first_name}", "citizenship": p.citizenship, "document": f"•••• {p.doc_number[-4:]}"} for p in order.passengers]}

@router.post("/cabinet/orders/{ref}/resend")
async def resend(ref: str, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)) -> dict:
    order = await session.scalar(select(Order).where(Order.ref == ref.upper(), Order.user_id == user.id))
    if not order: raise HTTPException(404, "Поездка не найдена")
    await send_email(user.email, f"Маршрутная квитанция {order.ref}", f"Заявка {order.ref}: {order.origin} → {order.destination}. Статус: {order.status.label}.")
    return {"ok": True}

@router.get("/cabinet/passengers", response_model=list[SavedPassengerOut])
async def passengers(user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)): return list(await session.scalars(select(ProfilePassenger).where(ProfilePassenger.user_id == user.id).order_by(ProfilePassenger.created_at.desc())))
@router.post("/cabinet/passengers", response_model=SavedPassengerOut, status_code=201)
async def add_passenger(payload: SavedPassengerIn, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    item = ProfilePassenger(user_id=user.id, **payload.model_dump()); session.add(item); await session.commit(); await session.refresh(item); return item
@router.delete("/cabinet/passengers/{passenger_id}", status_code=204)
async def delete_passenger(passenger_id: int, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    item = await session.get(ProfilePassenger, passenger_id)
    if not item or item.user_id != user.id: raise HTTPException(404, "Пассажир не найден")
    await session.delete(item); await session.commit()

@router.get("/cabinet/alerts")
async def alerts(user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    return list(await session.scalars(select(PriceAlert).where(PriceAlert.email == user.email).order_by(PriceAlert.created_at.desc())))
@router.delete("/cabinet/alerts/{alert_id}", status_code=204)
async def delete_alert(alert_id: int, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    item = await session.get(PriceAlert, alert_id)
    if not item or item.email != user.email: raise HTTPException(404, "Подписка не найдена")
    await session.delete(item); await session.commit()

@router.post("/cabinet/orders/{ref}/support", response_model=SupportOut, status_code=201)
async def support(ref: str, payload: SupportIn, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    order = await session.scalar(select(Order).where(Order.ref == ref.upper(), Order.user_id == user.id))
    if not order: raise HTTPException(404, "Поездка не найдена")
    item = SupportRequest(user_id=user.id, order_id=order.id, **payload.model_dump()); session.add(item); await session.commit(); await session.refresh(item)
    await send_email(user.email, f"Обращение по заявке {order.ref}", "Мы получили ваше обращение и ответим в ближайшее время.")
    return item
