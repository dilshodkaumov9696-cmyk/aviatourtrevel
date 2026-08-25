"""Регистрация, вход по паролю и вход через Google.

Сессия хранится в httpOnly cookie, а не в localStorage — так токен не
достать через XSS, и это же естественно ложится на редирект Google:
браузер просто переходит по ссылкам, cookie выставляется на ответе.
"""
from __future__ import annotations

import logging
from urllib.parse import urlencode

import httpx
from fastapi import (  # pyright: ignore[reportMissingImports]
    APIRouter,
    Depends,
    HTTPException,
    Request,
    Response,
)
from fastapi.responses import RedirectResponse  # pyright: ignore[reportMissingImports]
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.rate_limit import consume_once, enforce
from app.core.security import (
    RESET_TOKEN_EXPIRE_MINUTES,
    SESSION_COOKIE,
    VERIFY_TOKEN_EXPIRE_MINUTES,
    create_reset_token,
    create_session_token,
    create_verify_token,
    decode_reset_token,
    decode_verify_token,
    hash_password,
    verify_password,
)
from app.db.session import get_session
from app.models.user import User
from app.services.mailer import send_email

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
    email_verified: bool

    model_config = {"from_attributes": True}


class AuthProvidersOut(BaseModel):
    google: bool


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    token: str
    password: str = Field(..., min_length=6, max_length=128)


class VerifyEmailIn(BaseModel):
    token: str


async def _send_verification_email(user: User) -> None:
    token = create_verify_token(user.id)
    link = f"{settings.site_url}/verify-email?token={token}"
    await send_email(
        user.email,
        "Подтвердите email в Aviator",
        f"Чтобы подтвердить почту и увидеть свои прошлые заявки в личном кабинете, "
        f"перейдите по ссылке (действует 24 часа):\n{link}\n\n"
        f"Пока email не подтверждён, заявки, оформленные без входа на этот адрес, "
        f"не привязываются к аккаунту автоматически.",
    )


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
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> User:
    await enforce(
        request, "register",
        settings.auth_register_rate_limit, settings.auth_register_rate_limit_window,
    )

    existing = await session.scalar(select(User).where(User.email == payload.email))
    if existing is not None:
        raise HTTPException(status_code=409, detail="Этот email уже зарегистрирован")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        email_verified=False,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    logger.info("Зарегистрирован пользователь %s", user.email)
    await _send_verification_email(user)
    _set_session_cookie(response, user.id)
    return user


@router.post("/auth/login", response_model=UserOut)
async def login(
    payload: LoginIn,
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> User:
    # Лимит и на IP, и на email — иначе перебор одного аккаунта с разных IP
    # (или перебор многих аккаунтов с одного) остаётся без защиты.
    await enforce(
        request, "login",
        settings.auth_login_rate_limit, settings.auth_login_rate_limit_window,
        identifier=payload.email,
    )

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


@router.post("/auth/forgot-password", status_code=204)
async def forgot_password(
    payload: ForgotPasswordIn,
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> None:
    """Письмо со ссылкой восстановления. Ответ одинаков независимо от того,
    зарегистрирован ли email — иначе по коду ответа можно перебирать почты.
    Лимит проверяется до этой развилки и одинаков для обоих исходов, так что
    сам факт 429 тоже не выдаёт, существует ли аккаунт."""
    await enforce(
        request, "password-reset",
        settings.auth_password_reset_rate_limit, settings.auth_password_reset_rate_limit_window,
        identifier=payload.email,
    )

    user = await session.scalar(select(User).where(User.email == payload.email))
    if user is not None and user.is_active:
        token = create_reset_token(user.id)
        link = f"{settings.site_url}/reset-password?token={token}"
        await send_email(
            user.email,
            "Восстановление пароля Aviator",
            f"Чтобы задать новый пароль, перейдите по ссылке (действует 30 минут):\n{link}\n\n"
            f"Если вы не запрашивали восстановление — просто проигнорируйте письмо.",
        )
        logger.info("Отправлена ссылка восстановления пароля для %s", user.email)


@router.post("/auth/reset-password", status_code=204)
async def reset_password(
    payload: ResetPasswordIn,
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> None:
    # До декодирования не знаем аккаунт — лимит только по IP (иначе перебор
    # токенов подбором строки ничем не сдержан).
    await enforce(
        request, "reset-attempt",
        settings.auth_code_verify_rate_limit, settings.auth_code_verify_rate_limit_window,
    )

    user_id = decode_reset_token(payload.token)
    if user_id is None:
        raise HTTPException(status_code=400, detail="Ссылка недействительна или устарела")
    if not await consume_once("reset", payload.token, RESET_TOKEN_EXPIRE_MINUTES * 60):
        raise HTTPException(status_code=400, detail="Ссылка уже использована")
    user = await session.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=400, detail="Ссылка недействительна или устарела")

    user.hashed_password = hash_password(payload.password)
    await session.commit()
    logger.info("Пароль сброшен для %s", user.email)


@router.post("/auth/verify-email", status_code=204)
async def verify_email(
    payload: VerifyEmailIn,
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> None:
    await enforce(
        request, "verify-attempt",
        settings.auth_code_verify_rate_limit, settings.auth_code_verify_rate_limit_window,
    )

    user_id = decode_verify_token(payload.token)
    if user_id is None:
        raise HTTPException(status_code=400, detail="Ссылка недействительна или устарела")
    if not await consume_once("verify", payload.token, VERIFY_TOKEN_EXPIRE_MINUTES * 60):
        raise HTTPException(status_code=400, detail="Ссылка уже использована")
    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=400, detail="Ссылка недействительна или устарела")

    user.email_verified = True
    await session.commit()
    logger.info("Email подтверждён для %s", user.email)


@router.post("/auth/resend-verification", status_code=204)
async def resend_verification(
    request: Request,
    current_user: User = Depends(get_current_user),
) -> None:
    # Отправляем только на собственную почту текущего пользователя — спамить
    # чужой ящик так нельзя, лимит здесь только защищает от лишних писем себе.
    await enforce(
        request, "resend-verify",
        settings.auth_code_verify_rate_limit, settings.auth_code_verify_rate_limit_window,
        identifier=str(current_user.id),
    )
    if not current_user.email_verified:
        await _send_verification_email(current_user)


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
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> RedirectResponse:
    # Порог намеренно щедрый: обычный OAuth-флоу делает один такой запрос
    # (браузер сам переходит по редиректу Google), лимит только против явного
    # спама поддельными code, который иначе жёг бы наш httpx-запрос к Google
    # на каждую попытку.
    await enforce(
        request, "google-callback",
        settings.auth_google_callback_rate_limit, settings.auth_google_callback_rate_limit_window,
    )

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
    # Google уже проверил владение почтой при выпуске этого профиля.
    google_email_verified = bool(info.get("email_verified", True))

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
            email_verified=google_email_verified,
        )
        session.add(user)
    else:
        user.google_id = google_id
        user.avatar_url = info.get("picture") or user.avatar_url
        user.full_name = user.full_name or info.get("name")
        user.email_verified = user.email_verified or google_email_verified

    await session.commit()
    await session.refresh(user)

    logger.info("Вход через Google: %s", user.email)
    redirect = RedirectResponse(f"{settings.site_url}/account")
    _set_session_cookie(redirect, user.id)
    return redirect
