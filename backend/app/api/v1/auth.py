"""Регистрация, вход по паролю и вход через Google.

Сессия хранится в httpOnly cookie, а не в localStorage — так токен не
достать через XSS, и это же естественно ложится на редирект Google:
браузер просто переходит по ссылкам, cookie выставляется на ответе.
"""
from __future__ import annotations

import logging
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Response  # pyright: ignore[reportMissingImports]
from fastapi.responses import RedirectResponse  # pyright: ignore[reportMissingImports]
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import (
    SESSION_COOKIE,
    create_session_token,
    hash_password,
    verify_password,
)
from app.db.session import get_session
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter()

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

# secure=False здесь допустимо: локально сайт живёт на http://localhost.
# На проде эти адреса за https, и cookie должна ставиться с Secure — тогда
# переключить на settings.app_env == "production".
_COOKIE_SECURE = False


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    full_name: str | None = Field(None, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None
    avatar_url: str | None

    model_config = {"from_attributes": True}


class AuthProvidersOut(BaseModel):
    google: bool


def _set_session_cookie(response: Response, user_id: int) -> None:
    token = create_session_token(user_id)
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=settings.jwt_expire_minutes * 60,
        httponly=True,
        samesite="lax",
        secure=_COOKIE_SECURE,
        path="/",
    )


@router.post("/auth/register", response_model=UserOut, status_code=201)
async def register(
    payload: RegisterIn,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> User:
    existing = await session.scalar(select(User).where(User.email == payload.email))
    if existing is not None:
        raise HTTPException(status_code=409, detail="Этот email уже зарегистрирован")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    logger.info("Зарегистрирован пользователь %s", user.email)
    _set_session_cookie(response, user.id)
    return user


@router.post("/auth/login", response_model=UserOut)
async def login(
    payload: LoginIn,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> User:
    user = await session.scalar(select(User).where(User.email == payload.email))
    if user is None or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Аккаунт отключён")

    _set_session_cookie(response, user.id)
    return user


@router.post("/auth/logout", status_code=204)
async def logout(response: Response) -> None:
    response.delete_cookie(SESSION_COOKIE, path="/")


@router.get("/auth/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.get("/auth/providers", response_model=AuthProvidersOut)
async def auth_providers() -> AuthProvidersOut:
    """Фронтенд показывает только реально подключённые способы входа."""
    return AuthProvidersOut(google=bool(settings.google_client_id and settings.google_client_secret))


@router.get("/auth/google/login")
async def google_login() -> RedirectResponse:
    if not settings.google_client_id:
        raise HTTPException(status_code=500, detail="Google OAuth не настроен")

    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "online",
        "prompt": "select_account",
    }
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{urlencode(params)}")


@router.get("/auth/google/callback")
async def google_callback(
    code: str,
    session: AsyncSession = Depends(get_session),
) -> RedirectResponse:
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=500, detail="Google OAuth не настроен")

    async with httpx.AsyncClient(timeout=10.0) as client:
        token_res = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        if token_res.status_code != 200:
            logger.warning("Google token exchange failed: %s", token_res.text)
            raise HTTPException(status_code=502, detail="Не удалось подтвердить вход через Google")
        access_token = token_res.json()["access_token"]

        userinfo_res = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if userinfo_res.status_code != 200:
            raise HTTPException(status_code=502, detail="Не удалось получить данные профиля Google")
        info = userinfo_res.json()

    google_id = info["sub"]
    email = info.get("email")

    user = await session.scalar(select(User).where(User.google_id == google_id))
    if user is None and email:
        # Тот же email уже регистрировался паролем — просто привязываем Google.
        user = await session.scalar(select(User).where(User.email == email))

    if user is None:
        user = User(
            email=email,
            google_id=google_id,
            full_name=info.get("name"),
            avatar_url=info.get("picture"),
        )
        session.add(user)
    else:
        user.google_id = google_id
        user.avatar_url = info.get("picture") or user.avatar_url
        user.full_name = user.full_name or info.get("name")

    await session.commit()
    await session.refresh(user)

    logger.info("Вход через Google: %s", user.email)
    redirect = RedirectResponse(f"{settings.site_url}/account")
    _set_session_cookie(redirect, user.id)
    return redirect
