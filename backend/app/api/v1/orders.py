"""Заявки на билет: создать, посмотреть по коду, сменить статус."""
from __future__ import annotations

import logging
from datetime import UTC, date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query  # pyright: ignore[reportMissingImports]
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_manager_key
from app.db.session import get_session
from app.models.order import Order, OrderStatus, Passenger
from app.services.mailer import send_email

logger = logging.getLogger(__name__)
router = APIRouter()

# Куда можно перейти из каждого статуса. Заявка не должна прыгать
# из «создана» сразу в «выписан» — это скрыло бы потерю оплаты.
ALLOWED_TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.NEW: {OrderStatus.AWAITING_PAYMENT, OrderStatus.CANCELLED},
    OrderStatus.AWAITING_PAYMENT: {OrderStatus.PAID, OrderStatus.CANCELLED},
    OrderStatus.PAID: {OrderStatus.ISSUED, OrderStatus.CANCELLED},
    OrderStatus.ISSUED: set(),
    OrderStatus.CANCELLED: set(),
}


class PassengerIn(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=64)
    last_name: str = Field(..., min_length=1, max_length=64)
    middle_name: str | None = Field(None, max_length=64)
    dob: date
    gender: str = Field("male", max_length=8)
    citizenship: str = Field(..., min_length=1, max_length=64)
    doc_number: str = Field(..., min_length=4, max_length=32)
    doc_expiry: date | None = None

    @field_validator("dob")
    @classmethod
    def dob_in_past(cls, v: date) -> date:
        if v >= date.today():
            raise ValueError("Дата рождения должна быть в прошлом")
        return v


class PassengerOut(PassengerIn):
    id: int
    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    contact_email: EmailStr
    contact_phone: str = Field(..., min_length=5, max_length=32)

    origin: str = Field(..., min_length=3, max_length=3)
    destination: str = Field(..., min_length=3, max_length=3)
    depart_date: date
    return_date: date | None = None
    cabin: str = "economy"

    airline: str | None = Field(None, max_length=8)
    flight_number: str | None = Field(None, max_length=16)
    depart_at: str | None = Field(None, max_length=32)
    arrive_at: str | None = Field(None, max_length=32)

    tariff: str = Field("standard", max_length=16)
    seat: str | None = Field(None, max_length=8)
    promo: str | None = Field(None, max_length=32)
    payment_method: str = Field("card", max_length=16)

    total_amount: float = Field(..., gt=0, le=100_000_000)
    currency: str = Field("RUB", min_length=3, max_length=3)

    passengers: list[PassengerIn] = Field(..., min_length=1, max_length=9)

    @field_validator("origin", "destination")
    @classmethod
    def upper_iata(cls, v: str) -> str:
        return v.upper()


class OrderOut(BaseModel):
    id: int
    ref: str
    status: OrderStatus
    status_label: str
    contact_email: EmailStr
    contact_phone: str
    origin: str
    destination: str
    depart_date: date
    return_date: date | None
    cabin: str
    airline: str | None
    flight_number: str | None
    tariff: str
    seat: str | None
    payment_method: str
    total_amount: float
    currency: str
    pnr: str | None
    passengers: list[PassengerOut]
    created_at: datetime

    model_config = {"from_attributes": True}


class StatusPatch(BaseModel):
    status: OrderStatus


def _to_out(order: Order) -> dict:
    """status_label в модели — property, pydantic его сам не подхватит."""
    return {
        **{c.name: getattr(order, c.name) for c in order.__table__.columns},
        "status_label": order.status.label,
        "passengers": order.passengers,
    }


@router.post("/orders", response_model=OrderOut, status_code=201)
async def create_order(
    payload: OrderCreate,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Оформить заявку. Возвращает код вида AV-7K2M9X — по нему клиент её найдёт."""
    if payload.origin == payload.destination:
        raise HTTPException(status_code=422, detail="Города вылета и прилёта совпадают")
    if payload.return_date and payload.return_date < payload.depart_date:
        raise HTTPException(status_code=422, detail="Дата возврата раньше даты вылета")
    if payload.depart_date < date.today():
        raise HTTPException(status_code=422, detail="Дата вылета уже прошла")

    data = payload.model_dump(exclude={"passengers"})
    order = Order(**data, passengers=[Passenger(**p.model_dump()) for p in payload.passengers])
    session.add(order)
    await session.commit()
    await session.refresh(order)

    logger.info("Создана заявка %s: %s→%s, пассажиров %d",
                order.ref, order.origin, order.destination, len(order.passengers))

    await send_email(
        order.contact_email,
        f"Заявка {order.ref} принята",
        f"Здравствуйте!\n\n"
        f"Мы приняли вашу заявку {order.ref} на маршрут "
        f"{order.origin} → {order.destination} ({order.depart_date:%d.%m.%Y}).\n"
        f"Пассажиров: {len(order.passengers)}. Сумма: {float(order.total_amount):,.0f} "
        f"{order.currency}.\n\n".replace(",", " ")
        + f"Статус заявки: {order.status.label}. Мы свяжемся с вами для подтверждения.\n",
    )

    return _to_out(order)


@router.get("/orders/{ref}", response_model=OrderOut)
async def get_order(
    ref: str,
    email: EmailStr = Query(..., description="Подтверждение владельца заявки"),
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Заявка по коду.

    Код короткий, поэтому одного его мало — просим ещё и почту, чтобы
    перебором нельзя было вычитать чужие паспортные данные.
    """
    order = await session.scalar(select(Order).where(Order.ref == ref.upper()))
    if order is None or order.contact_email != email:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    return _to_out(order)


@router.get("/orders", response_model=list[OrderOut])
async def list_orders(
    email: EmailStr = Query(..., description="Чьи заявки показать"),
    session: AsyncSession = Depends(get_session),
) -> list[dict]:
    """Все заявки указанной почты, свежие сверху."""
    result = await session.scalars(
        select(Order).where(Order.contact_email == email).order_by(Order.created_at.desc())
    )
    return [_to_out(o) for o in result]


@router.patch("/orders/{ref}/status", response_model=OrderOut, dependencies=[Depends(require_manager_key)])
async def update_status(
    ref: str,
    patch: StatusPatch,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Сменить статус заявки.

    Ручка для менеджера. Когда появится собственная выписка, сюда же
    будет ходить интеграция с консолидатором. Требует заголовок
    X-Manager-Key (см. require_manager_key в app/api/deps.py).
    """
    order = await session.scalar(select(Order).where(Order.ref == ref.upper()))
    if order is None:
        raise HTTPException(status_code=404, detail="Заявка не найдена")

    if patch.status not in ALLOWED_TRANSITIONS[order.status]:
        raise HTTPException(
            status_code=409,
            detail=f"Нельзя перейти из «{order.status.label}» в «{patch.status.label}»",
        )

    order.status = patch.status
    now = datetime.now(UTC)
    if patch.status is OrderStatus.PAID:
        order.paid_at = now
    elif patch.status is OrderStatus.ISSUED:
        order.issued_at = now

    await session.commit()
    await session.refresh(order)

    await send_email(
        order.contact_email,
        f"Заявка {order.ref}: {order.status.label.lower()}",
        f"Статус вашей заявки {order.ref} изменился на «{order.status.label}».\n",
    )
    return _to_out(order)
