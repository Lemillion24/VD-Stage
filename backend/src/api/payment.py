from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.auth import require_role
from src.database.db_connection import get_db
from src.database.repositories import PlaceRepository, TicketRepository
from src.schemas.payment import PaymentRequest, PaymentResponse
from src.services.payment import PaymentService
from src.utils.currency import format_currency

router = APIRouter(dependencies=[Depends(require_role("agent", "admin", "super-admin"))])


@router.post("/payment", response_model=PaymentResponse)
async def payment(
    request: PaymentRequest,
    session: AsyncSession = Depends(get_db),
) -> PaymentResponse:
    service = PaymentService(
        ticket_repo=TicketRepository(session),
        place_repo=PlaceRepository(session),
    )
    result = await service.process_payment(
        ticket_id=request.ticket_id,
        payment_method=request.payment_method,
    )
    return PaymentResponse(
        success=True,
        ticket_id=result["ticket_id"],
        amount=result["amount"],
        payment_method=result["payment_method"],
        transaction_id=result["transaction_id"],
        message=f"Paiement de {format_currency(result['amount'])} accepté",
    )
