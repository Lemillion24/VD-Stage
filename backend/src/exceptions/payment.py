from __future__ import annotations


class PaymentException(Exception):
    def __init__(self, message: str, status_code: int = 400) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class TicketNotFoundException(PaymentException):
    def __init__(self, ticket_id: str) -> None:
        super().__init__(
            message=f"Ticket '{ticket_id}' introuvable",
            status_code=404,
        )


class TicketAlreadyPaidException(PaymentException):
    def __init__(self, ticket_id: str) -> None:
        super().__init__(
            message=f"Ticket '{ticket_id}' déjà payé",
            status_code=400,
        )


class PaymentFailedException(PaymentException):
    def __init__(self, reason: str = "Échec du paiement") -> None:
        super().__init__(message=reason, status_code=500)


class InvalidPaymentMethodException(PaymentException):
    def __init__(self, method: str) -> None:
        super().__init__(
            message=f"Méthode de paiement invalide: '{method}'",
            status_code=400,
        )
