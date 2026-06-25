from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.auth import get_authenticated, require_role, _hash_password
from src.config.settings import get_settings
from src.database.db_connection import get_db
from src.database.repositories import EmployeeRepository, ParkingRepository, PlaceRepository, TicketRepository

settings = get_settings()
router = APIRouter(dependencies=[Depends(get_authenticated)])


class AgentCreate(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1)
    role: str = Field(default="agent", pattern=r"^(agent|admin)$")
    parking_id: int | None = None


class AgentUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    email: str | None = Field(default=None, max_length=100)
    password: str | None = Field(default=None)
    role: str | None = Field(default=None, pattern=r"^(agent|admin|super-admin)$")
    parking_id: int | None = None
    is_active: bool | None = None


class AgentOut(BaseModel):
    id: int
    employee_id: str
    name: str
    email: str | None
    role: str
    parking_id: int | None
    is_active: bool
    validation_status: str = "approved"


@router.get("/admin/agents", response_model=list[AgentOut])
async def list_agents(
    user: dict = Depends(require_role("admin", "super-admin")),
    session: AsyncSession = Depends(get_db),
) -> list[AgentOut]:
    repo = EmployeeRepository(session)
    agents = await repo.get_all()
    return [AgentOut(
        id=a.id, employee_id=a.employee_id, name=a.name, email=a.email,
        role=a.role, parking_id=a.parking_id, is_active=a.is_active,
        validation_status=a.validation_status,
    ) for a in agents]


@router.post("/admin/agents", response_model=AgentOut, status_code=201)
async def create_agent(
    body: AgentCreate,
    user: dict = Depends(require_role("admin", "super-admin")),
    session: AsyncSession = Depends(get_db),
) -> AgentOut:
    repo = EmployeeRepository(session)
    existing = await repo.find_by_employee_id(body.employee_id)
    if existing:
        raise HTTPException(409, f"Agent '{body.employee_id}' existe déjà")

    is_super = user["role"] == "super-admin"
    validation = "approved" if is_super else "pending"
    agent = await repo.create(
        employee_id=body.employee_id, name=body.name, email=body.email,
        password_hash=_hash_password(body.password), role=body.role,
        parking_id=body.parking_id, is_active=is_super, validation_status=validation,
    )
    return AgentOut(
        id=agent.id, employee_id=agent.employee_id, name=agent.name,
        email=agent.email, role=agent.role, parking_id=agent.parking_id,
        is_active=agent.is_active, validation_status=agent.validation_status,
    )


@router.put("/admin/agents/{employee_id}", response_model=AgentOut)
async def update_agent(
    employee_id: str,
    body: AgentUpdate,
    user: dict = Depends(require_role("admin", "super-admin")),
    session: AsyncSession = Depends(get_db),
) -> AgentOut:
    repo = EmployeeRepository(session)
    agent = await repo.find_by_employee_id(employee_id)
    if not agent:
        raise HTTPException(404, f"Agent '{employee_id}' introuvable")

    is_super = user["role"] == "super-admin"
    pw_hash = _hash_password(body.password) if body.password else None

    agent = await repo.update(
        employee_id=employee_id, name=body.name, email=body.email,
        role=body.role, parking_id=body.parking_id,
        is_active=body.is_active if is_super else False,
        password_hash=pw_hash,
        validation_status="approved" if is_super else "pending",
    )
    if not agent:
        raise HTTPException(500, "Échec de la mise à jour")
    return AgentOut(
        id=agent.id, employee_id=agent.employee_id, name=agent.name,
        email=agent.email, role=agent.role, parking_id=agent.parking_id,
        is_active=agent.is_active, validation_status=agent.validation_status,
    )


@router.delete("/admin/agents/{employee_id}", status_code=204)
async def delete_agent(
    employee_id: str,
    user: dict = Depends(require_role("super-admin")),
    session: AsyncSession = Depends(get_db),
) -> None:
    repo = EmployeeRepository(session)
    deleted = await repo.delete(employee_id)
    if not deleted:
        raise HTTPException(404, f"Agent '{employee_id}' introuvable")


@router.get("/admin/pending", response_model=list[AgentOut])
async def list_pending(
    user: dict = Depends(require_role("super-admin")),
    session: AsyncSession = Depends(get_db),
) -> list[AgentOut]:
    repo = EmployeeRepository(session)
    agents = await repo.get_pending()
    return [AgentOut(
        id=a.id, employee_id=a.employee_id, name=a.name, email=a.email,
        role=a.role, parking_id=a.parking_id, is_active=a.is_active,
        validation_status=a.validation_status,
    ) for a in agents]


@router.post("/admin/agents/{employee_id}/approve", response_model=AgentOut)
async def approve_agent(
    employee_id: str,
    user: dict = Depends(require_role("super-admin")),
    session: AsyncSession = Depends(get_db),
) -> AgentOut:
    repo = EmployeeRepository(session)
    agent = await repo.find_by_employee_id(employee_id)
    if not agent:
        raise HTTPException(404, f"Agent '{employee_id}' introuvable")
    agent.validation_status = "approved"
    agent.is_active = True
    await session.flush()
    return AgentOut(
        id=agent.id, employee_id=agent.employee_id, name=agent.name,
        email=agent.email, role=agent.role, parking_id=agent.parking_id,
        is_active=agent.is_active, validation_status=agent.validation_status,
    )


@router.post("/admin/agents/{employee_id}/reject", status_code=204)
async def reject_agent(
    employee_id: str,
    user: dict = Depends(require_role("super-admin")),
    session: AsyncSession = Depends(get_db),
) -> None:
    repo = EmployeeRepository(session)
    deleted = await repo.delete(employee_id)
    if not deleted:
        raise HTTPException(404, f"Agent '{employee_id}' introuvable")


class TarifInfo(BaseModel):
    tarif_horaire: float
    tarif_journalier: float
    delai_grace_minutes: int
    taxe_parking: float
    description: str


class TicketInfo(BaseModel):
    ticket_id: str
    plate_number: str
    parking_name: str
    place_number: str
    entry_time: str
    amount: float
    status: str
    owner_name: str | None = None
    telephone: str | None = None
    email: str | None = None
    reservation_time: int | None = None


class ParkingInfo(BaseModel):
    id: int
    name: str
    address: str | None
    total_places: int
    available_places: int
    is_active: bool


@router.get("/tickets", response_model=list[TicketInfo])
async def get_tickets(
    session: AsyncSession = Depends(get_db),
) -> list[TicketInfo]:
    ticket_repo = TicketRepository(session)
    tickets = await ticket_repo.get_all_tickets()
    return [TicketInfo(
        ticket_id=t.ticket_id, plate_number=t.vehicule.plate_number,
        parking_name=t.place.parking.name, place_number=t.place.place_number,
        entry_time=t.entry_time.isoformat(), amount=t.amount, status=t.status,
        owner_name=t.vehicule.owner_name,
        telephone=t.telephone,
        email=t.email,
        reservation_time=t.reservation_time,
    ) for t in tickets]


@router.get("/tarifs", response_model=TarifInfo)
async def get_tarifs() -> TarifInfo:
    return TarifInfo(
        tarif_horaire=settings.TARIF_HORAIRE,
        tarif_journalier=settings.TARIF_JOURNALIER,
        delai_grace_minutes=settings.DELAI_GRACE,
        taxe_parking=settings.TAXE_PARKING,
        description=(
            f"{settings.TARIF_HORAIRE:.0f} FC/heure, "
            f"{settings.TARIF_JOURNALIER:.0f} FC/jour max, "
            f"{settings.DELAI_GRACE} min gratuites, "
            f"{settings.TAXE_PARKING * 100:.0f}% taxe incluse"
        ),
    )


@router.get("/parkings", response_model=list[ParkingInfo])
async def get_parkings(
    session: AsyncSession = Depends(get_db),
) -> list[ParkingInfo]:
    parking_repo = ParkingRepository(session)
    place_repo = PlaceRepository(session)
    parkings = await parking_repo.get_all()
    result = []
    for p in parkings:
        available = await place_repo.count_available(p.id)
        result.append(ParkingInfo(
            id=p.id, name=p.name, address=p.address,
            total_places=p.total_places, available_places=available, is_active=p.is_active,
        ))
    return result
