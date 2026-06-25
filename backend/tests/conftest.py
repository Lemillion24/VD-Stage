from __future__ import annotations

from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock

import pytest
import pytest_asyncio
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from src.services.check_in import CheckInService
from src.services.check_out import CheckOutService
from src.services.payment import PaymentService


@pytest.fixture
def vehicule_repo() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def parking_repo() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def place_repo() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def ticket_repo() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def check_in_service(
    vehicule_repo: AsyncMock,
    parking_repo: AsyncMock,
    place_repo: AsyncMock,
    ticket_repo: AsyncMock,
) -> CheckInService:
    return CheckInService(vehicule_repo, parking_repo, place_repo, ticket_repo)


@pytest.fixture
def check_out_service(
    ticket_repo: AsyncMock,
    vehicule_repo: AsyncMock,
) -> CheckOutService:
    return CheckOutService(ticket_repo, vehicule_repo)


@pytest.fixture
def payment_service(
    ticket_repo: AsyncMock,
    place_repo: AsyncMock,
) -> PaymentService:
    return PaymentService(ticket_repo, place_repo)


@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    from src.config.settings import get_settings

    settings = get_settings()

    app = FastAPI(title=settings.APP_NAME)

    from src.api.router import api_router
    app.include_router(api_router)

    @app.get("/")
    async def root() -> dict:
        return {"name": settings.APP_NAME, "status": "running"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest_asyncio.fixture
async def auth_client(async_client: AsyncClient) -> AsyncGenerator[AsyncClient, None]:
    resp = await async_client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    async_client.headers["Authorization"] = f"Bearer {resp.json()['token']}"
    yield async_client
