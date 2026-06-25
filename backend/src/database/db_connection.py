from __future__ import annotations

from collections.abc import AsyncGenerator
from functools import lru_cache

from loguru import logger
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from src.config.settings import get_settings


class Base(DeclarativeBase):
    pass


@lru_cache
def get_async_engine():
    settings = get_settings()
    url = settings.DATABASE_URL
    if url.startswith("postgresql"):
        url = url.replace("postgresql://", "postgresql+asyncpg://")
    return create_async_engine(
        url,
        echo=False,
    )


@lru_cache
def get_session_factory():
    return async_sessionmaker(
        bind=get_async_engine(),
        class_=AsyncSession,
        expire_on_commit=False,
    )


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    engine = get_async_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created successfully")
