from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


PAYMENT_METHODS = Literal["cash", "card", "mobile_money", "qr_code"]


class PaymentRequest(BaseModel):
    ticket_id: str = Field(..., min_length=1, max_length=50, description="ID du ticket")
    payment_method: PAYMENT_METHODS = Field(..., description="Mode de paiement")


class PaymentResponse(BaseModel):
    success: bool = True
    ticket_id: str
    amount: float
    payment_method: str
    transaction_id: str
    message: str = "Paiement accepté"
