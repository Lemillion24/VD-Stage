from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.auth import require_role
from src.database.db_connection import get_db
from src.database.repositories import (
    ParkingRepository,
    PlaceRepository,
    TicketRepository,
    VehiculeRepository,
)
from src.schemas.check_in import CheckInRequest, CheckInResponse
from src.services.check_in import CheckInService

router = APIRouter(dependencies=[Depends(require_role("agent", "admin", "super-admin"))])


@router.post("/check-in", response_model=CheckInResponse)
async def check_in(
    request: CheckInRequest,
    session: AsyncSession = Depends(get_db),
) -> CheckInResponse:
    service = CheckInService(
        vehicule_repo=VehiculeRepository(session),
        parking_repo=ParkingRepository(session),
        place_repo=PlaceRepository(session),
        ticket_repo=TicketRepository(session),
    )
    result = await service.check_in(
        plate_number=request.plate_number,
        parking_id=request.parking_id,
        vehicle_type=request.vehicle_type,
        owner_name=request.owner_name,
        telephone=request.telephone,
        email=request.email,
        reservation_time=request.reservation_time,
    )
    return CheckInResponse(
        success=True,
        ticket_id=result["ticket_id"],
        place_number=result["place_number"],
        entry_time=result["entry_time"],
        message=f"Véhicule entré au {result['parking_name']}",
        owner_name=result["owner_name"],
        telephone=result["telephone"],
        email=result["email"],
        reservation_time=result["reservation_time"],
    )
