from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database.db_connection import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticket_id: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    vehicule_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("vehicules.id"), nullable=False
    )
    place_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("places.id"), nullable=False
    )
    entry_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    exit_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    duration_minutes: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    amount: Mapped[float] = mapped_column(Float, default=0.0, server_default="0.0")
    status: Mapped[str] = mapped_column(
        String(20), default="active", server_default="active"
    )
    payment_method: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_paid: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    telephone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(100), nullable=True)
    reservation_time: Mapped[int | None] = mapped_column(Integer, nullable=True)

    vehicule: Mapped["Vehicule"] = relationship("Vehicule", back_populates="tickets")
    place: Mapped["Place"] = relationship("Place", back_populates="tickets")
