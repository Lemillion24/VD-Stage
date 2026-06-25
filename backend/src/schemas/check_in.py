from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


VEHICLE_TYPES = Literal["sedan", "compact", "suv", "motorbike", "truck"]


class CheckInRequest(BaseModel):
    plate_number: str = Field(..., min_length=1, max_length=20, description="Numéro de plaque")
    parking_id: int = Field(..., gt=0, description="ID du parking")
    vehicle_type: VEHICLE_TYPES = Field(default="sedan", description="Type de véhicule")
    owner_name: str = Field(..., min_length=1, max_length=100, description="Nom du propriétaire")
    telephone: str | None = Field(default=None, max_length=20, description="Numéro de téléphone")
    email: str | None = Field(default=None, max_length=100, description="Adresse email")
    reservation_time: int | None = Field(default=None, ge=1, description="Temps de réservation en minutes")


class CheckInResponse(BaseModel):
    success: bool = True
    ticket_id: str
    place_number: str
    entry_time: str
    message: str = "Véhicule entré avec succès"
    owner_name: str | None = None
    telephone: str | None = None
    email: str | None = None
    reservation_time: int | None = None
