"""Интеграционные тесты лимитов на реальных auth-эндпоинтах через ASGI-клиент."""
from __future__ import annotations

import uuid

from httpx import AsyncClient

from app.core.config import settings
from app.core.security import create_reset_token, create_verify_token
from tests.conftest import TEST_EMAIL_PREFIX


def _email() -> str:
    return f"{TEST_EMAIL_PREFIX}{uuid.uuid4().hex[:16]}@example.com"


def _fake_ip() -> str:
    return f"198.51.100.{uuid.uuid4().int % 250 + 1}"


async def _register(client: AsyncClient, email: str, password: str, ip: str | None = None) -> dict:
    # Свой X-Forwarded-For на каждую регистрацию: иначе тесты в этом модуле сами
    # упрутся в AUTH_REGISTER_RATE_LIMIT, деля один "IP" ASGI-клиента.
    res = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password},
        headers={"X-Forwarded-For": ip or _fake_ip()},
    )
    assert res.status_code == 201, res.text
    return res.json()


async def _login(client: AsyncClient, email: str, password: str, ip: str | None = None):
    headers = {"X-Forwarded-For": ip} if ip else {}
    body = {"email": email, "password": password}
    return await client.post("/api/v1/auth/login", json=body, headers=headers)


async def _forgot(client: AsyncClient, email: str, ip: str | None = None):
    headers = {"X-Forwarded-For": ip} if ip else {}
    return await client.post("/api/v1/auth/forgot-password", json={"email": email}, headers=headers)


async def test_register_rate_limited_per_ip(client: AsyncClient):
    limit = settings.auth_register_rate_limit
    ip = _fake_ip()

    for _ in range(limit):
        res = await client.post(
            "/api/v1/auth/register",
            json={"email": _email(), "password": "SomePass123!"},
            headers={"X-Forwarded-For": ip},
        )
        assert res.status_code == 201

    blocked = await client.post(
        "/api/v1/auth/register",
        json={"email": _email(), "password": "SomePass123!"},
        headers={"X-Forwarded-For": ip},
    )
    assert blocked.status_code == 429

    # Другой IP — свежий бюджет, регистрация проходит.
    other = await _register(client, _email(), "SomePass123!")
    assert other["email"]


async def test_normal_login_flow_works(client: AsyncClient):
    email, password = _email(), "RightPass123!"
    await _register(client, email, password)

    res = await _login(client, email, password)
    assert res.status_code == 200
    assert res.json()["email"] == email


async def test_wrong_passwords_pass_until_limit_then_block(client: AsyncClient):
    email, password = _email(), "RightPass123!"
    await _register(client, email, password)
    limit = settings.auth_login_rate_limit

    # До лимита — обычные 401 (неверный пароль), не 429.
    for _ in range(limit):
        res = await _login(client, email, "wrong-one")
        assert res.status_code == 401

    # Лимит исчерпан — 429 с Retry-After, без трейсбека в теле.
    blocked = await _login(client, email, "wrong-one")
    assert blocked.status_code == 429
    assert "Retry-After" in blocked.headers
    assert "Traceback" not in blocked.text

    # Даже верный пароль теперь блокируется — лимит защищает аккаунт, а не только пароль.
    still_blocked = await _login(client, email, password)
    assert still_blocked.status_code == 429


async def test_login_does_not_leak_account_existence(client: AsyncClient):
    """401 на несуществующий email и на существующий с неверным паролем — идентичны."""
    existing_email, password = _email(), "RightPass123!"
    await _register(client, existing_email, password)
    nonexistent_email = _email()

    r1 = await _login(client, existing_email, "wrong")
    r2 = await _login(client, nonexistent_email, "wrong")

    assert r1.status_code == r2.status_code == 401
    assert r1.json()["detail"] == r2.json()["detail"]


async def test_different_ips_do_not_cross_block(client: AsyncClient):
    """IP из X-Forwarded-For изолированы друг от друга по IP-измерению лимита."""
    limit = settings.auth_login_rate_limit
    email_a, email_b = _email(), _email()  # разные email, чтобы не сработал email-лимит
    ip_a, ip_b = "203.0.113.10", "203.0.113.99"

    for _ in range(limit):
        res = await _login(client, email_a, "wrong", ip=ip_a)
        assert res.status_code == 401

    blocked = await _login(client, email_a, "wrong", ip=ip_a)
    assert blocked.status_code == 429

    # Другой IP, другой email — свежий бюджет, не зависит от первого IP.
    fresh = await _login(client, email_b, "wrong", ip=ip_b)
    assert fresh.status_code == 401


async def test_forgot_password_rate_limited(client: AsyncClient):
    limit = settings.auth_password_reset_rate_limit
    existing_email = _email()
    await _register(client, existing_email, "SomePass123!")
    ip = _fake_ip()

    for _ in range(limit):
        res = await _forgot(client, existing_email, ip=ip)
        assert res.status_code == 204

    blocked = await _forgot(client, existing_email, ip=ip)
    assert blocked.status_code == 429
    assert "Retry-After" in blocked.headers


async def test_forgot_password_response_uniform_regardless_of_email_existence(client: AsyncClient):
    """Каждый запрос — со своим свежим IP, чтобы сравнивать именно эффект
    существования email, а не попасть под лимит одного из измерений."""
    existing_email = _email()
    await _register(client, existing_email, "SomePass123!")
    nonexistent_email = _email()

    r1 = await _forgot(client, existing_email, ip=_fake_ip())
    r2 = await _forgot(client, nonexistent_email, ip=_fake_ip())
    assert r1.status_code == r2.status_code == 204


async def test_reset_password_attempts_are_rate_limited(client: AsyncClient):
    limit = settings.auth_code_verify_rate_limit
    body = {"token": "garbage", "password": "NewPass123!"}
    for _ in range(limit):
        res = await client.post("/api/v1/auth/reset-password", json=body)
        assert res.status_code == 400  # токен нерабочий, но лимит ещё не исчерпан

    blocked = await client.post("/api/v1/auth/reset-password", json=body)
    assert blocked.status_code == 429


async def test_reset_password_token_is_single_use(client: AsyncClient):
    email = _email()
    user = await _register(client, email, "OldPass123!")
    token = create_reset_token(user["id"])

    first = await client.post(
        "/api/v1/auth/reset-password", json={"token": token, "password": "NewPass123!"},
    )
    assert first.status_code == 204

    second = await client.post(
        "/api/v1/auth/reset-password", json={"token": token, "password": "Another123!"},
    )
    assert second.status_code == 400

    # Новый пароль из первого запроса действительно применился.
    login = await _login(client, email, "NewPass123!")
    assert login.status_code == 200


async def test_verify_email_attempts_are_rate_limited(client: AsyncClient):
    limit = settings.auth_code_verify_rate_limit
    for _ in range(limit):
        res = await client.post("/api/v1/auth/verify-email", json={"token": "garbage"})
        assert res.status_code == 400

    blocked = await client.post("/api/v1/auth/verify-email", json={"token": "garbage"})
    assert blocked.status_code == 429


async def test_verify_email_token_is_single_use(client: AsyncClient):
    email = _email()
    user = await _register(client, email, "SomePass123!")
    token = create_verify_token(user["id"])

    first = await client.post("/api/v1/auth/verify-email", json={"token": token})
    assert first.status_code == 204

    second = await client.post("/api/v1/auth/verify-email", json={"token": token})
    assert second.status_code == 400


async def test_successful_login_still_works_after_unrelated_activity(client: AsyncClient):
    """Лимитер не должен мешать обычному логину постороннего пользователя."""
    noisy_email = _email()
    await _register(client, noisy_email, "NoisyPass123!")
    for _ in range(3):
        await _login(client, noisy_email, "wrong")

    quiet_email, quiet_password = _email(), "QuietPass123!"
    await _register(client, quiet_email, quiet_password)
    res = await _login(client, quiet_email, quiet_password)
    assert res.status_code == 200
