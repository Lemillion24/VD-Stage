from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database.db_connection import Base


class Place(Base):
    __tablename__ = "places"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    place_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    parking_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("parkings.id"), nullable=False
    )
    place_type: Mapped[str] = mapped_column(String(20), default="standard", server_default="standard")
    is_occupied: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")

    parking: Mapped["Parking"] = relationship("Parking", back_populates="places")
    tickets: Mapped[list["Ticket"]] = relationship(
        "Ticket", back_populates="place", cascade="all, delete-orphan"
    )
