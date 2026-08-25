"""Пароли и JWT-токены личного кабинета: сессия, восстановление пароля, подтверждение email.

Все три типа токенов подписаны одним secret_key, поэтому каждый несёт
claim "purpose" и проверяется строго на него: токен восстановления пароля
не должен приниматься как cookie сессии, и наоборот. Без этой проверки
ссылка из письма "восстановить пароль" была бы валидным способом войти в
чужой аккаунт, не меняя пароль.
"""
from __future__ import annotations

from datetime import UTC, datetime, timedelta

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# bcrypt в окружении проекта конфликтует с текущей версией его нативного
# расширения и ломает регистрацию. PBKDF2-SHA256 не требует внешнего бинарного
# модуля, является безопасным KDF и стабильно работает везде. bcrypt оставлен
# вторым, чтобы существующие аккаунты можно было мигрировать при следующем входе.
_pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated=["bcrypt"])

SESSION_COOKIE = "aviator_session"

RESET_TOKEN_EXPIRE_MINUTES = 30
VERIFY_TOKEN_EXPIRE_MINUTES = 60 * 24


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return _pwd_context.verify(password, hashed_password)


def _create_purpose_token(user_id: int, purpose: str, minutes: int) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=minutes)
    payload = {"sub": str(user_id), "exp": expire, "purpose": purpose}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def _decode_purpose_token(token: str, purpose: str) -> int | None:
    """ID пользователя из токена нужного типа, либо None если токен просрочен,
    битый или подписан для другой цели (сессия/сброс пароля/подтверждение)."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError:
        return None
    if payload.get("purpose") != purpose:
        return None
    sub = payload.get("sub")
    if sub is None:
        return None
    try:
        return int(sub)
    except ValueError:
        return None


def create_session_token(user_id: int) -> str:
    return _create_purpose_token(user_id, "session", settings.jwt_expire_minutes)


def decode_session_token(token: str) -> int | None:
    return _decode_purpose_token(token, "session")


def create_reset_token(user_id: int) -> str:
    """Токен ссылки восстановления пароля. Живёт недолго."""
    return _create_purpose_token(user_id, "reset", RESET_TOKEN_EXPIRE_MINUTES)


def decode_reset_token(token: str) -> int | None:
    return _decode_purpose_token(token, "reset")


def create_verify_token(user_id: int) -> str:
    """Токен ссылки подтверждения email при регистрации."""
    return _create_purpose_token(user_id, "verify", VERIFY_TOKEN_EXPIRE_MINUTES)


def decode_verify_token(token: str) -> int | None:
    return _decode_purpose_token(token, "verify")
