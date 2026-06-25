from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database.db_connection import Base


class Parking(Base):
    __tablename__ = "parkings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    address: Mapped[str | None] = mapped_column(String(200), nullable=True)
    total_places: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    places: Mapped[list["Place"]] = relationship(
        "Place", back_populates="parking", cascade="all, delete-orphan"
    )
    employees: Mapped[list["Employee"]] = relationship(
        "Employee", back_populates="parking", cascade="all, delete-orphan"
    )
