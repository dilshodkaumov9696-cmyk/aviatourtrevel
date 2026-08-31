"""Шифрование паспортных номеров не зависит от БД."""
from app.core.pii import decrypt_doc, doc_last4, encrypt_doc


def test_encrypt_roundtrip() -> None:
    raw = "1234567890"
    token = encrypt_doc(raw)
    assert token.startswith("enc:v1:")
    assert decrypt_doc(token) == raw
    assert doc_last4(token) == "7890"


def test_plaintext_passthrough() -> None:
    assert decrypt_doc("AB1234567") == "AB1234567"
    assert encrypt_doc("") == ""
