from __future__ import annotations

from fastapi import APIRouter

from src.api.check_in import router as check_in_router
from src.api.check_out import router as check_out_router
from src.api.payment import router as payment_router
from src.api.admin import router as admin_router
from src.api.auth import router as auth_router
from src.api.public import router as public_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router, tags=["Auth"])
api_router.include_router(public_router, tags=["Public"])
api_router.include_router(check_in_router, tags=["Check-In"])
api_router.include_router(check_out_router, tags=["Check-Out"])
api_router.include_router(payment_router, tags=["Payment"])
api_router.include_router(admin_router, tags=["Admin"])
