from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Path, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.database.db_connection import get_db
from src.models.ticket import Ticket
from src.schemas.check_in import CheckInResponse

router = APIRouter(tags=["Public"])


@router.get("/ticket/{ticket_id}", response_model=CheckInResponse)
async def lookup_ticket(
    ticket_id: str = Path(..., max_length=50),
    session: AsyncSession = Depends(get_db),
) -> CheckInResponse:
    stmt = (
        select(Ticket)
        .options(selectinload(Ticket.place))
        .where(Ticket.ticket_id == ticket_id)
    )
    result = await session.execute(stmt)
    ticket = result.scalar_one_or_none()
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket introuvable")
    return CheckInResponse(
        success=True,
        ticket_id=ticket.ticket_id,
        place_number=ticket.place.place_number if ticket.place else "",
        entry_time=ticket.entry_time.isoformat() if ticket.entry_time else "",
    )
