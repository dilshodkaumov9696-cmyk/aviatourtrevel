"""Настройка логирования.

Главное здесь — приглушить httpx. На уровне INFO он печатает полный URL
запроса, а мы ходим в Travelpayouts с токеном в query-параметрах: строка
вида `...&token=7153fed...` оседала бы в логах и в любом их сборщике.
"""
from __future__ import annotations

import logging

# Логгеры, чей INFO содержит секреты или просто шумит.
NOISY = ("httpx", "httpcore")


def setup_logging(level: int = logging.INFO) -> None:
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    for name in NOISY:
        logging.getLogger(name).setLevel(logging.WARNING)
