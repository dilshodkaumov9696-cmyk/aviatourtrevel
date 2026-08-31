"""Шифрование паспортных номеров at-rest.

Ключ выводится из SECRET_KEY: отдельный PII-секрет не заводим, пока
оператор не вынесет его в свой KMS. Старые значения без префикса
считаются открытым текстом и при чтении отдаются как есть.
"""
from __future__ import annotations

import base64
import hashlib

from cryptography.fernet import Fernet, InvalidToken

from app.core.config import settings

_PREFIX = "enc:v1:"


def _fernet() -> Fernet:
    digest = hashlib.sha256(settings.secret_key.encode("utf-8")).digest()
    return Fernet(base64.urlsafe_b64encode(digest))


def encrypt_doc(value: str) -> str:
    raw = (value or "").strip()
    if not raw or raw.startswith(_PREFIX):
        return raw
    return _PREFIX + _fernet().encrypt(raw.encode("utf-8")).decode("ascii")


def decrypt_doc(value: str) -> str:
    raw = value or ""
    if not raw.startswith(_PREFIX):
        return raw
    try:
        return _fernet().decrypt(raw[len(_PREFIX) :].encode("ascii")).decode("utf-8")
    except (InvalidToken, ValueError):
        return raw


def doc_last4(value: str) -> str:
    plain = decrypt_doc(value)
    return plain[-4:] if len(plain) >= 4 else plain
