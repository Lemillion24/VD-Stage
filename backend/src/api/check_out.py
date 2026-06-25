from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.auth import require_role
from src.database.db_connection import get_db
from src.database.repositories import TicketRepository, VehiculeRepository
from src.schemas.check_out import CheckOutRequest, CheckOutResponse
from src.services.check_out import CheckOutService
from src.utils.currency import format_currency

router = APIRouter(dependencies=[Depends(require_role("agent", "admin", "super-admin"))])


@router.post("/check-out", response_model=CheckOutResponse)
async def check_out(
    request: CheckOutRequest,
    session: AsyncSession = Depends(get_db),
) -> CheckOutResponse:
    service = CheckOutService(
        ticket_repo=TicketRepository(session),
        vehicule_repo=VehiculeRepository(session),
    )
    result = await service.get_check_out_amount(ticket_id=request.ticket_id)
    return CheckOutResponse(
        success=True,
        ticket_id=result["ticket_id"],
        duration_minutes=result["duration_minutes"],
        amount=result["amount"],
        exit_time=result["exit_time"],
        actual_duration=result.get("actual_duration"),
        reservation_time=result.get("reservation_time"),
        message=f"Montant à payer: {format_currency(result['amount'])}",
    )
