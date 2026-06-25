from __future__ import annotations

from loguru import logger

from src.constants.payment_methods import ALLOWED_PAYMENT_METHODS
from src.database.repositories import PlaceRepository, TicketRepository
from src.exceptions.payment import PaymentFailedException, TicketAlreadyPaidException, TicketNotFoundException
from src.utils.datetime_utils import generate_transaction_id


class PaymentService:
    def __init__(self, ticket_repo: TicketRepository, place_repo: PlaceRepository) -> None:
        self.ticket_repo = ticket_repo
        self.place_repo = place_repo

    async def process_payment(self, ticket_id: str, payment_method: str) -> dict:
        if payment_method not in ALLOWED_PAYMENT_METHODS:
            raise ValueError(f"Méthode de paiement invalide: '{payment_method}'")

        ticket = await self.ticket_repo.find_by_ticket_id(ticket_id)
        if ticket is None:
            raise TicketNotFoundException(ticket_id)
        if ticket.is_paid:
            raise TicketAlreadyPaidException(ticket_id)

        transaction_id = generate_transaction_id()

        updated_ticket = await self.ticket_repo.mark_paid(
            ticket_id=ticket_id, payment_method=payment_method,
        )
        if updated_ticket is None:
            raise PaymentFailedException("Impossible de mettre à jour le ticket")

        await self.place_repo.release(ticket.place_id)

        logger.info("Payment: ticket={}, amount={} FC, method={}, txn={}", ticket_id, ticket.amount, payment_method, transaction_id)

        return {
            "ticket_id": ticket_id, "amount": ticket.amount,
            "payment_method": payment_method, "transaction_id": transaction_id,
        }
