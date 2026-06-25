from __future__ import annotations

import asyncio

from src.database.db_connection import get_session_factory, init_db

# Import all models to resolve relationships
from src.models import Employee, Parking, Place, Ticket, Vehicule  # noqa: F401

SEED_PARKINGS = [
    {"name": "Parking Central", "address": "Avenue de la République", "total_places": 20},
    {"name": "Parking Gare", "address": "Place de la Gare", "total_places": 15},
    {"name": "Parking Marché", "address": "Rue du Commerce", "total_places": 10},
]


async def seed() -> None:
    await init_db()

    factory = get_session_factory()
    async with factory() as session:
        for p in SEED_PARKINGS:
            parking = Parking(name=p["name"], address=p["address"], total_places=p["total_places"])
            session.add(parking)
            await session.flush()

            for i in range(1, p["total_places"] + 1):
                place = Place(
                    place_number=f"{parking.id:02d}-{i:03d}",
                    parking_id=parking.id,
                    place_type="standard",
                )
                session.add(place)

        await session.commit()

    print(f"✅  {len(SEED_PARKINGS)} parkings créés avec leurs places.")


asyncio.run(seed())
