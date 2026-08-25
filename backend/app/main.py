import logging
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request  # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware  # pyright: ignore[reportMissingImports]

from app.api.v1 import alerts, auth, cabinet, hello, orders, search
from app.core.config import settings
from app.core.logging import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    yield


app = FastAPI(
    title="Aviator Web API",
    description="Сайт продажи авиабилетов — backend API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    """Базовые заголовки безопасности. Без CSP: сайт грузит карты, шрифты и
    аватары с внешних доменов — правильный CSP под это нужно проектировать
    отдельно, а не гадать, чтобы не сломать рендер."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


@app.middleware("http")
async def request_log(request: Request, call_next):
    """Correlation ID связывает логи одного запроса, не логируя query с PII."""
    request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex
    started = time.perf_counter()
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    logging.getLogger("app.request").info(
        "request_id=%s method=%s path=%s status=%s duration_ms=%d",
        request_id, request.method, request.url.path, response.status_code,
        (time.perf_counter() - started) * 1000,
    )
    return response


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "app": settings.app_name, "env": settings.app_env}


app.include_router(hello.router, prefix="/api/v1", tags=["hello"])
app.include_router(search.router, prefix="/api/v1", tags=["search"])
app.include_router(alerts.router, prefix="/api/v1", tags=["alerts"])
app.include_router(orders.router, prefix="/api/v1", tags=["orders"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(cabinet.router, prefix="/api/v1", tags=["cabinet"])
