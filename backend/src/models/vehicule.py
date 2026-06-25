from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database.db_connection import Base


class Vehicule(Base):
    __tablename__ = "vehicules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    plate_number: Mapped[str] = mapped_column(
        String(20), unique=True, index=True, nullable=False
    )
    vehicle_type: Mapped[str] = mapped_column(String(20), nullable=False)
    owner_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    telephone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    tickets: Mapped[list["Ticket"]] = relationship(
        "Ticket", back_populates="vehicule", cascade="all, delete-orphan"
    )
