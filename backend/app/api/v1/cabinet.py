"""Авторизованный API личного кабинета."""
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_manager_key
from app.core.config import settings
from app.core.security import SESSION_COOKIE, hash_password, verify_password
from app.db.session import get_session
from app.models.cabinet import ProfilePassenger, SupportRequest, SupportRequestKind, SupportRequestStatus
from app.models.order import Order
from app.models.price_alert import PriceAlert
from app.models.user import User
from app.services.mailer import send_email

router = APIRouter()

class SavedPassengerIn(BaseModel):
    first_name: str = Field(min_length=1, max_length=64); last_name: str = Field(min_length=1, max_length=64)
    middle_name: str | None = None; dob: date; gender: str | None = Field(None, max_length=8)
    citizenship: str = Field(min_length=1, max_length=64)
    doc_number: str = Field(min_length=4, max_length=32); doc_expiry: date | None = None
class SavedPassengerOut(SavedPassengerIn):
    id: int
    model_config = {"from_attributes": True}
class SupportIn(BaseModel):
    kind: SupportRequestKind; message: str = Field(min_length=8, max_length=2000)
class SupportOut(BaseModel):
    id: int; kind: SupportRequestKind; status: SupportRequestStatus; message: str
    model_config = {"from_attributes": True}
class MySupportOut(SupportOut):
    order_ref: str; created_at: datetime
class AdminSupportOut(MySupportOut):
    user_email: str
class SupportStatusIn(BaseModel):
    status: SupportRequestStatus
class ProfileIn(BaseModel):
    full_name: str | None = Field(None, max_length=128)
class ProfileOut(BaseModel):
    id: int; email: str; full_name: str | None; avatar_url: str | None; email_verified: bool
    model_config = {"from_attributes": True}
class ChangePasswordIn(BaseModel):
    current_password: str | None = None
    new_password: str = Field(min_length=6, max_length=128)
class DeleteAccountIn(BaseModel):
    password: str | None = None

async def _claim_orders(session: AsyncSession, user: User) -> None:
    """Привязывает гостевые заявки (оформленные без входа) к аккаунту по email.

    Только если email подтверждён: иначе зарегистрировавшись на чужой адрес
    можно было бы увидеть чужие заявки, ни разу не доказав владение почтой.
    """
    if not user.email_verified:
        return
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
    return {"ref": order.ref, "status": order.status.value, "status_label": order.status.label, "origin": order.origin, "destination": order.destination, "depart_date": order.depart_date, "return_date": order.return_date, "airline": order.airline, "flight_number": order.flight_number, "depart_at": order.depart_at, "arrive_at": order.arrive_at, "tariff": order.tariff, "seat": order.seat, "total_amount": float(order.total_amount), "currency": order.currency, "pnr": order.pnr, "ticket_numbers": order.ticket_numbers, "paid_at": order.paid_at, "issued_at": order.issued_at, "passengers": [{"name": f"{p.last_name} {p.first_name}", "citizenship": p.citizenship, "document": f"•••• {p.doc_number[-4:]}"} for p in order.passengers]}

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
    # Подписки на цену тоже привязаны только по email (создаются анонимно на
    # странице поиска) — без подтверждённой почты не показываем чужие.
    if not user.email_verified: return []
    return list(await session.scalars(select(PriceAlert).where(PriceAlert.email == user.email).order_by(PriceAlert.created_at.desc())))
@router.delete("/cabinet/alerts/{alert_id}", status_code=204)
async def delete_alert(alert_id: int, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    item = await session.get(PriceAlert, alert_id)
    if not user.email_verified or not item or item.email != user.email: raise HTTPException(404, "Подписка не найдена")
    await session.delete(item); await session.commit()

@router.post("/cabinet/orders/{ref}/support", response_model=SupportOut, status_code=201)
async def support(ref: str, payload: SupportIn, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    order = await session.scalar(select(Order).where(Order.ref == ref.upper(), Order.user_id == user.id))
    if not order: raise HTTPException(404, "Поездка не найдена")
    item = SupportRequest(user_id=user.id, order_id=order.id, **payload.model_dump()); session.add(item); await session.commit(); await session.refresh(item)
    await send_email(user.email, f"Обращение по заявке {order.ref}", "Мы получили ваше обращение и ответим в ближайшее время.")
    if settings.support_notify_email:
        await send_email(settings.support_notify_email, f"Новое обращение по заявке {order.ref}", f"От: {user.email}\nТип: {payload.kind.value}\n\n{payload.message}")
    return item

@router.get("/cabinet/support", response_model=list[MySupportOut])
async def my_support(user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    rows = await session.execute(select(SupportRequest, Order.ref).join(Order, Order.id == SupportRequest.order_id).where(SupportRequest.user_id == user.id).order_by(SupportRequest.created_at.desc()))
    return [MySupportOut(id=r.id, kind=r.kind, status=r.status, message=r.message, created_at=r.created_at, order_ref=ref) for r, ref in rows]

@router.patch("/cabinet/profile", response_model=ProfileOut)
async def update_profile(payload: ProfileIn, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    user.full_name = payload.full_name
    await session.commit(); await session.refresh(user)
    return user

@router.post("/cabinet/profile/password", status_code=204)
async def change_password(payload: ChangePasswordIn, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if user.hashed_password and not (payload.current_password and verify_password(payload.current_password, user.hashed_password)):
        raise HTTPException(401, "Неверный текущий пароль")
    user.hashed_password = hash_password(payload.new_password)
    await session.commit()

@router.post("/cabinet/profile/delete", status_code=204)
async def delete_account(payload: DeleteAccountIn, response: Response, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if user.hashed_password and not (payload.password and verify_password(payload.password, user.hashed_password)):
        raise HTTPException(401, "Неверный пароль")
    await session.delete(user); await session.commit()
    response.delete_cookie(SESSION_COOKIE, path="/")

@router.get("/cabinet/admin/support", response_model=list[AdminSupportOut], dependencies=[Depends(require_manager_key)])
async def admin_support(status: SupportRequestStatus | None = None, session: AsyncSession = Depends(get_session)):
    """Очередь обращений для оператора. Доступна только при корректном X-Manager-Key."""
    query = select(SupportRequest, Order.ref, User.email).join(Order, Order.id == SupportRequest.order_id).join(User, User.id == SupportRequest.user_id).order_by(SupportRequest.created_at.desc()).limit(200)
    if status is not None: query = query.where(SupportRequest.status == status)
    rows = await session.execute(query)
    return [AdminSupportOut(id=r.id, kind=r.kind, status=r.status, message=r.message, created_at=r.created_at, order_ref=ref, user_email=email) for r, ref, email in rows]

@router.patch("/cabinet/admin/support/{ticket_id}/status", response_model=AdminSupportOut, dependencies=[Depends(require_manager_key)])
async def admin_support_status(ticket_id: int, payload: SupportStatusIn, session: AsyncSession = Depends(get_session)):
    item = await session.get(SupportRequest, ticket_id)
    if not item: raise HTTPException(404, "Обращение не найдено")
    item.status = payload.status
    await session.commit(); await session.refresh(item)
    ref = await session.scalar(select(Order.ref).where(Order.id == item.order_id))
    email = await session.scalar(select(User.email).where(User.id == item.user_id))
    return AdminSupportOut(id=item.id, kind=item.kind, status=item.status, message=item.message, created_at=item.created_at, order_ref=ref, user_email=email)
