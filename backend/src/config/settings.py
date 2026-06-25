from __future__ import annotations

import os
import sys
from functools import lru_cache
from pathlib import Path

from loguru import logger
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent.parent / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    DATABASE_URL: str = Field(default="sqlite+aiosqlite:///./parking_dev.db")
    APP_NAME: str = Field(default="Parking Management System")
    LOG_LEVEL: str = Field(default="INFO")
    DEBUG: bool = Field(default=True)

    TARIF_HORAIRE: float = Field(default=500.0, gt=0)
    TARIF_JOURNALIER: float = Field(default=3000.0, gt=0)
    DELAI_GRACE: int = Field(default=15, ge=0)
    TAXE_PARKING: float = Field(default=0.10, ge=0.0, le=1.0)

    PRICING_FACTORS: dict[str, float] = Field(default={
        "motorbike": 0.5, "compact": 0.8, "sedan": 1.0, "suv": 1.2, "truck": 1.5,
    })

    def get_pricing_factor(self, vehicle_type: str) -> float:
        return self.PRICING_FACTORS.get(vehicle_type.lower(), 1.0)

    def configure_logging(self) -> None:
        logger.remove()
        fmt = "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <level>{message}</level>"
        logger.add(
            sink=os.environ.get("LOG_FILE", "logs/parking.log"),
            rotation="10 MB",
            retention="30 days",
            level=self.LOG_LEVEL,
            format=fmt,
        )
        logger.add(sink=sys.stderr, level=self.LOG_LEVEL, format=fmt)


@lru_cache
def get_settings() -> Settings:
    return Settings()
