from __future__ import annotations

from unittest.mock import AsyncMock

import pytest

from src.exceptions.parking import ParkingFullException, VehicleAlreadyInsideException
from src.models.parking import Parking
from src.models.place import Place
from src.models.ticket import Ticket
from src.models.vehicule import Vehicule
from src.services.check_in import CheckInService


class TestCheckInService:
    async def test_check_in_success(
        self,
        check_in_service: CheckInService,
        parking_repo: AsyncMock,
        place_repo: AsyncMock,
        vehicule_repo: AsyncMock,
        ticket_repo: AsyncMock,
    ) -> None:
        parking = Parking(id=1, name="Test Parking", total_places=50)
        parking_repo.find_active_by_id.return_value = parking
        vehicule_repo.find_by_plate.return_value = None
        vehicule_repo.create.return_value = Vehicule(id=1, plate_number="ABC123", vehicle_type="sedan")
        place = Place(id=1, place_number="A1", is_occupied=False, is_available=True)
        place_repo.find_available.return_value = place
        result = await check_in_service.check_in(
            plate_number="ABC123",
            parking_id=1,
            vehicle_type="sedan",
            owner_name="John",
        )

        assert result["ticket_id"].startswith("TKT-")
        assert result["place_number"] == "A1"
        assert result["place_number"] == "A1"
        place_repo.occupy.assert_awaited_once_with(1)
        vehicule_repo.create.assert_awaited_once()

    async def test_check_in_parking_not_found(
        self,
        check_in_service: CheckInService,
        parking_repo: AsyncMock,
    ) -> None:
        parking_repo.find_active_by_id.return_value = None
        with pytest.raises(ParkingFullException):
            await check_in_service.check_in(
                plate_number="ABC123",
                parking_id=999,
                vehicle_type="sedan",
            )

    async def test_check_in_vehicle_already_inside(
        self,
        check_in_service: CheckInService,
        parking_repo: AsyncMock,
        vehicule_repo: AsyncMock,
        ticket_repo: AsyncMock,
    ) -> None:
        parking_repo.find_active_by_id.return_value = Parking(id=1, name="Test")
        vehicule = Vehicule(id=1, plate_number="ABC123", vehicle_type="sedan")
        vehicule_repo.find_by_plate.return_value = vehicule
        ticket_repo.find_active_ticket_for_vehicule.return_value = Ticket(
            id=1, ticket_id="TKT-001", status="active"
        )

        with pytest.raises(VehicleAlreadyInsideException):
            await check_in_service.check_in(
                plate_number="ABC123",
                parking_id=1,
                vehicle_type="sedan",
            )

    async def test_check_in_parking_full(
        self,
        check_in_service: CheckInService,
        parking_repo: AsyncMock,
        vehicule_repo: AsyncMock,
        ticket_repo: AsyncMock,
        place_repo: AsyncMock,
    ) -> None:
        parking_repo.find_active_by_id.return_value = Parking(id=1, name="Full Parking")
        vehicule_repo.find_by_plate.return_value = None
        vehicule_repo.create.return_value = Vehicule(id=1, plate_number="XYZ", vehicle_type="sedan")
        ticket_repo.find_active_ticket_for_vehicule.return_value = None
        place_repo.find_available.return_value = None

        with pytest.raises(ParkingFullException):
            await check_in_service.check_in(
                plate_number="XYZ",
                parking_id=1,
                vehicle_type="sedan",
            )
