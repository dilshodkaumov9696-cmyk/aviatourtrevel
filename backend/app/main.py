from contextlib import asynccontextmanager

from fastapi import FastAPI # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware # pyright: ignore[reportMissingImports]

from app.api.v1 import alerts, auth, hello, orders, search
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


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "app": settings.app_name, "env": settings.app_env}


app.include_router(hello.router, prefix="/api/v1", tags=["hello"])
app.include_router(search.router, prefix="/api/v1", tags=["search"])
app.include_router(alerts.router, prefix="/api/v1", tags=["alerts"])
app.include_router(orders.router, prefix="/api/v1", tags=["orders"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
