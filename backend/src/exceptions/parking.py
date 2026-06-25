from __future__ import annotations


class ParkingException(Exception):
    def __init__(self, message: str, status_code: int = 400) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ParkingFullException(ParkingException):
    def __init__(self, parking_name: str) -> None:
        super().__init__(
            message=f"Parking '{parking_name}' est plein",
            status_code=400,
        )


class VehicleAlreadyInsideException(ParkingException):
    def __init__(self, plate_number: str) -> None:
        super().__init__(
            message=f"Véhicule '{plate_number}' déjà dans le parking",
            status_code=400,
        )


