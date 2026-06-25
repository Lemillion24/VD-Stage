from __future__ import annotations

from datetime import datetime, timezone
from unittest.mock import AsyncMock

import pytest

from src.exceptions.payment import TicketAlreadyPaidException, TicketNotFoundException
from src.models.ticket import Ticket
from src.models.vehicule import Vehicule
from src.services.check_out import CheckOutService


class TestCheckOutService:
    async def test_get_check_out_amount_success(
        self,
        check_out_service: CheckOutService,
        ticket_repo: AsyncMock,
        vehicule_repo: AsyncMock,
    ) -> None:
        entry_time = datetime(2024, 1, 15, 10, 0, 0, tzinfo=timezone.utc)
        ticket = Ticket(
            id=1,
            ticket_id="TKT-001",
            vehicule_id=1,
            place_id=1,
            entry_time=entry_time,
            status="active",
        )
        ticket_repo.find_by_ticket_id.return_value = ticket
        vehicule = Vehicule(id=1, plate_number="ABC123", vehicle_type="sedan")
        vehicule_repo.get_by_id.return_value = vehicule

        result = await check_out_service.get_check_out_amount(ticket_id="TKT-001")

        assert result["ticket_id"] == "TKT-001"
        assert result["duration_minutes"] >= 0
        assert result["amount"] >= 0
        ticket_repo.update_exit.assert_awaited_once()

    async def test_get_check_out_amount_ticket_not_found(
        self,
        check_out_service: CheckOutService,
        ticket_repo: AsyncMock,
    ) -> None:
        ticket_repo.find_by_ticket_id.return_value = None

        with pytest.raises(TicketNotFoundException):
            await check_out_service.get_check_out_amount(ticket_id="INVALID")

    async def test_get_check_out_amount_already_paid(
        self,
        check_out_service: CheckOutService,
        ticket_repo: AsyncMock,
    ) -> None:
        ticket_repo.find_by_ticket_id.return_value = Ticket(
            id=1,
            ticket_id="TKT-001",
            vehicule_id=1,
            place_id=1,
            status="paid",
            entry_time=datetime(2024, 1, 15, 10, 0, 0, tzinfo=timezone.utc),
        )

        with pytest.raises(TicketAlreadyPaidException):
            await check_out_service.get_check_out_amount(ticket_id="TKT-001")
