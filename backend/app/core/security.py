"""Пароли и JWT-сессии личного кабинета."""
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


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return _pwd_context.verify(password, hashed_password)


def create_session_token(user_id: int) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_session_token(token: str) -> int | None:
    """ID пользователя из токена, либо None если токен просрочен/битый."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError:
        return None
    sub = payload.get("sub")
    if sub is None:
        return None
    try:
        return int(sub)
    except ValueError:
        return None
