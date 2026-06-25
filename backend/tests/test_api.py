from __future__ import annotations

from unittest.mock import ANY, AsyncMock, patch

import pytest
from httpx import AsyncClient


class TestAPIEndpoints:
    async def test_root_endpoint(self, async_client: AsyncClient) -> None:
        response = await async_client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "status" in data

    async def test_tarifs_endpoint(self, auth_client: AsyncClient) -> None:
        response = await auth_client.get("/api/tarifs")
        assert response.status_code == 200
        data = response.json()
        assert data["tarif_horaire"] == 500.0
        assert data["tarif_journalier"] == 3000.0
        assert data["delai_grace_minutes"] == 15

    @patch("src.api.check_in.CheckInService.check_in")
    async def test_check_in_endpoint(
        self,
        mock_check_in: AsyncMock,
        auth_client: AsyncClient,
    ) -> None:
        mock_check_in.return_value = {
            "ticket_id": "TKT-2024-001",
            "place_number": "A1",
            "entry_time": "2024-01-15T10:30:00",
            "parking_name": "Test Parking",
            "owner_name": "John",
            "telephone": None,
            "email": None,
            "reservation_time": None,
        }

        response = await auth_client.post(
            "/api/check-in",
            json={
                "plate_number": "ABC123",
                "parking_id": 1,
                "vehicle_type": "sedan",
                "owner_name": "John",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["ticket_id"] == "TKT-2024-001"
        assert data["place_number"] == "A1"
        assert data["success"] is True

    @patch("src.api.check_out.CheckOutService.get_check_out_amount")
    async def test_check_out_endpoint(
        self,
        mock_check_out: AsyncMock,
        auth_client: AsyncClient,
    ) -> None:
        mock_check_out.return_value = {
            "ticket_id": "TKT-001",
            "duration_minutes": 60,
            "amount": 550.0,
            "exit_time": "2024-01-15T11:30:00",
            "plate_number": "ABC123",
            "vehicle_type": "sedan",
            "actual_duration": 60,
            "reservation_time": None,
        }

        response = await auth_client.post(
            "/api/check-out",
            json={"ticket_id": "TKT-001"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["ticket_id"] == "TKT-001"
        assert data["amount"] == 550.0

    @patch("src.api.payment.PaymentService.process_payment")
    async def test_payment_endpoint(
        self,
        mock_payment: AsyncMock,
        auth_client: AsyncClient,
    ) -> None:
        mock_payment.return_value = {
            "ticket_id": "TKT-001",
            "amount": 550.0,
            "payment_method": "cash",
            "transaction_id": "TXN-2024-001",
        }

        response = await auth_client.post(
            "/api/payment",
            json={
                "ticket_id": "TKT-001",
                "payment_method": "cash",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["transaction_id"] == "TXN-2024-001"
        assert data["success"] is True

    async def test_check_in_validation_error(self, auth_client: AsyncClient) -> None:
        response = await auth_client.post(
            "/api/check-in",
            json={"plate_number": "", "parking_id": 0},
        )
        assert response.status_code == 422

    async def test_check_out_validation_error(self, auth_client: AsyncClient) -> None:
        response = await auth_client.post(
            "/api/check-out",
            json={},
        )
        assert response.status_code == 422
