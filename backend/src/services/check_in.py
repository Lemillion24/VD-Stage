from __future__ import annotations

from datetime import datetime, timezone

from loguru import logger

from src.database.repositories import (
    ParkingRepository,
    PlaceRepository,
    TicketRepository,
    VehiculeRepository,
)
from src.exceptions.parking import (
    ParkingFullException,
    VehicleAlreadyInsideException,
)
from src.utils.datetime_utils import generate_ticket_id


class CheckInService:
    def __init__(
        self,
        vehicule_repo: VehiculeRepository,
        parking_repo: ParkingRepository,
        place_repo: PlaceRepository,
        ticket_repo: TicketRepository,
    ) -> None:
        self.vehicule_repo = vehicule_repo
        self.parking_repo = parking_repo
        self.place_repo = place_repo
        self.ticket_repo = ticket_repo

    async def check_in(
        self,
        plate_number: str,
        parking_id: int,
        vehicle_type: str = "sedan",
        owner_name: str | None = None,
        telephone: str | None = None,
        email: str | None = None,
        reservation_time: int | None = None,
    ) -> dict:
        parking = await self.parking_repo.find_active_by_id(parking_id)
        if parking is None:
            raise ParkingFullException(f"Parking #{parking_id}")

        vehicule = await self.vehicule_repo.find_by_plate(plate_number)
        if vehicule is None:
            vehicule = await self.vehicule_repo.create(
                plate_number=plate_number,
                vehicle_type=vehicle_type,
                owner_name=owner_name,
                telephone=telephone,
                email=email,
            )
        else:
            active_ticket = await self.ticket_repo.find_active_ticket_for_vehicule(vehicule.id)
            if active_ticket is not None:
                raise VehicleAlreadyInsideException(plate_number)

        place = await self.place_repo.find_available(parking_id)
        if place is None:
            raise ParkingFullException(parking.name)

        await self.place_repo.occupy(place.id)

        ticket_id = generate_ticket_id()
        entry_time = datetime.now(timezone.utc)
        await self.ticket_repo.create(
            ticket_id=ticket_id,
            vehicule_id=vehicule.id,
            place_id=place.id,
            entry_time=entry_time,
            telephone=telephone,
            email=email,
            reservation_time=reservation_time,
        )

        logger.info(
            "Check-in: ticket={}, plate={}, place={}, parking={}, reservation={}",
            ticket_id,
            plate_number,
            place.place_number,
            parking.name,
            reservation_time,
        )

        return {
            "ticket_id": ticket_id,
            "place_number": place.place_number,
            "entry_time": entry_time.isoformat(),
            "parking_name": parking.name,
            "owner_name": owner_name,
            "telephone": telephone,
            "email": email,
            "reservation_time": reservation_time,
        }
