from __future__ import annotations

import math
from datetime import datetime, timezone

from loguru import logger

from src.config.settings import get_settings
from src.database.repositories import TicketRepository, VehiculeRepository
from src.exceptions.payment import TicketAlreadyPaidException, TicketNotFoundException
from src.utils.datetime_utils import calculate_duration_minutes


def _calculate_rate(duration_minutes: int, vehicle_type: str) -> float:
    settings = get_settings()
    if duration_minutes <= settings.DELAI_GRACE:
        return 0.0
    hours = math.ceil(duration_minutes / 60)
    total = (
        hours
        * settings.TARIF_HORAIRE
        * settings.get_pricing_factor(vehicle_type)
        * (1 + settings.TAXE_PARKING)
    )
    return round(min(total, settings.TARIF_JOURNALIER), 2)


class CheckOutService:
    def __init__(
        self,
        ticket_repo: TicketRepository,
        vehicule_repo: VehiculeRepository,
    ) -> None:
        self.ticket_repo = ticket_repo
        self.vehicule_repo = vehicule_repo

    async def get_check_out_amount(self, ticket_id: str) -> dict:
        ticket = await self.ticket_repo.find_by_ticket_id(ticket_id)
        if ticket is None:
            raise TicketNotFoundException(ticket_id)
        if ticket.status == "paid":
            raise TicketAlreadyPaidException(ticket_id)

        vehicule = await self.vehicule_repo.get_by_id(ticket.vehicule_id)
        if vehicule is None:
            raise TicketNotFoundException(ticket_id)

        exit_time = datetime.now(timezone.utc)
        actual_duration = calculate_duration_minutes(ticket.entry_time, exit_time)
        effective_duration = max(actual_duration, ticket.reservation_time or 0)
        amount = _calculate_rate(effective_duration, vehicule.vehicle_type)

        await self.ticket_repo.update_exit(
            ticket_id=ticket_id,
            exit_time=exit_time,
            duration_minutes=effective_duration,
            amount=amount,
        )

        logger.info(
            "Check-out: ticket={}, actual={}min, effective={}min, amount={} FC",
            ticket_id,
            actual_duration,
            effective_duration,
            amount,
        )

        return {
            "ticket_id": ticket_id,
            "duration_minutes": effective_duration,
            "actual_duration": actual_duration,
            "reservation_time": ticket.reservation_time,
            "amount": amount,
            "exit_time": exit_time.isoformat(),
        }
