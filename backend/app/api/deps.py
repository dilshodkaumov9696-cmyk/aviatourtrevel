"""FastAPI-зависимости для определения текущего пользователя по cookie-сессии."""
from __future__ import annotations

import hmac

from fastapi import Depends, Header, HTTPException, Request  # pyright: ignore[reportMissingImports]
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import SESSION_COOKIE, decode_session_token
from app.db.session import get_session
from app.models.user import User


async def _user_from_cookie(request: Request, session: AsyncSession) -> User | None:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        return None
    user_id = decode_session_token(token)
    if user_id is None:
        return None
    return await session.get(User, user_id)


async def get_current_user(
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> User:
    user = await _user_from_cookie(request, session)
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="Не авторизован")
    return user


async def get_current_user_optional(
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> User | None:
    user = await _user_from_cookie(request, session)
    if user is not None and not user.is_active:
        return None
    return user


async def require_manager_key(
    request: Request,
    session: AsyncSession = Depends(get_session),
    x_manager_key: str | None = Header(None),
) -> None:
    """Оператор: X-Manager-Key или cookie-сессия пользователя с is_staff."""
    if settings.manager_api_key and x_manager_key and hmac.compare_digest(
        x_manager_key, settings.manager_api_key
    ):
        return
    user = await _user_from_cookie(request, session)
    if user is not None and user.is_active and user.is_staff:
        return
    if not settings.manager_api_key:
        raise HTTPException(
            status_code=503,
            detail="MANAGER_API_KEY не настроен и нет сессии сотрудника — ручка отключена",
        )
    raise HTTPException(
        status_code=401,
        detail="Нужен X-Manager-Key или вход сотрудника (is_staff)",
    )
