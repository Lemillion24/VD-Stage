from __future__ import annotations

import os
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger

from src.api.router import api_router
from src.config.settings import get_settings
from src.database.db_connection import init_db
from src.exceptions.parking import ParkingException
from src.exceptions.payment import PaymentException

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    settings.configure_logging()
    logger.info("Starting application")
    await init_db()
    yield
    logger.info("Shutting down application")


app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
)

origins_str = os.environ.get("CORS_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_str.split(",") if origins_str != "*" else ["*"],
    allow_credentials=origins_str != "*",
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.exception_handler(ParkingException)
async def parking_exception_handler(request: Request, exc: ParkingException) -> JSONResponse:
    logger.warning("Parking error: {}", exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": "Erreur de traitement"},
    )


@app.exception_handler(PaymentException)
async def payment_exception_handler(request: Request, exc: PaymentException) -> JSONResponse:
    logger.warning("Payment error: {}", exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": "Erreur de paiement"},
    )


@app.get("/")
async def root() -> dict:
    return {"name": settings.APP_NAME, "status": "running"}
