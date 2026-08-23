"""Отправка писем.

Пока SMTP_HOST не задан, письмо не уходит наружу, а печатается в лог.
Это сделано намеренно: воркер ценовых подписок можно гонять локально,
не заводя почтовый ящик и не рискуя разослать что-то живым адресатам.
"""
from __future__ import annotations

import asyncio
import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)


def _send_sync(to: str, subject: str, body: str) -> None:
    """Блокирующая отправка. Вызывается в отдельном потоке."""
    message = EmailMessage()
    message["From"] = settings.smtp_from
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as smtp:
        if settings.smtp_use_tls:
            smtp.starttls()
        if settings.smtp_user:
            smtp.login(settings.smtp_user, settings.smtp_password)
        smtp.send_message(message)


async def send_email(to: str, subject: str, body: str) -> bool:
    """Отправляет письмо. True — ушло, False — не настроено или не удалось.

    smtplib синхронный, поэтому уводим его в поток, чтобы не блокировать
    цикл событий на время SMTP-сессии.
    """
    if not settings.smtp_host:
        logger.info("SMTP не настроен, письмо не отправлено.\nКому: %s\nТема: %s\n%s", to, subject, body)
        return False

    try:
        await asyncio.to_thread(_send_sync, to, subject, body)
    except (smtplib.SMTPException, OSError) as exc:
        logger.error("Не удалось отправить письмо на %s: %s", to, exc)
        return False

    logger.info("Письмо отправлено на %s: %s", to, subject)
    return True
