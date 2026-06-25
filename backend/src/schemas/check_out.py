from __future__ import annotations

from pydantic import BaseModel, Field


class CheckOutRequest(BaseModel):
    ticket_id: str = Field(..., min_length=1, max_length=50, description="ID du ticket")


class CheckOutResponse(BaseModel):
    success: bool = True
    ticket_id: str
    duration_minutes: int
    amount: float
    exit_time: str
    message: str = "Montant à payer calculé"
    actual_duration: int | None = None
    reservation_time: int | None = None
