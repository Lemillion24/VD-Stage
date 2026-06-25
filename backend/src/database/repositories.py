from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime

from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.models.employee import Employee
from src.models.parking import Parking
from src.models.place import Place
from src.models.ticket import Ticket
from src.models.vehicule import Vehicule


class VehiculeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def find_by_plate(self, plate_number: str) -> Vehicule | None:
        result = await self.session.execute(
            select(Vehicule).where(Vehicule.plate_number == plate_number)
        )
        return result.scalar_one_or_none()

    async def create(self, plate_number: str, vehicle_type: str, owner_name: str | None = None, telephone: str | None = None, email: str | None = None) -> Vehicule:
        vehicule = Vehicule(
            plate_number=plate_number,
            vehicle_type=vehicle_type,
            owner_name=owner_name,
            telephone=telephone,
            email=email,
            is_active=True,
        )
        self.session.add(vehicule)
        await self.session.flush()
        return vehicule

    async def get_by_id(self, vehicule_id: int) -> Vehicule | None:
        result = await self.session.execute(
            select(Vehicule).where(Vehicule.id == vehicule_id)
        )
        return result.scalar_one_or_none()


class PlaceRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def find_available(self, parking_id: int) -> Place | None:
        result = await self.session.execute(
            select(Place).where(
                Place.parking_id == parking_id,
                Place.is_occupied.is_(False),
                Place.is_available.is_(True),
            ).limit(1)
        )
        return result.scalar_one_or_none()

    async def find_by_id(self, place_id: int) -> Place | None:
        result = await self.session.execute(
            select(Place).where(Place.id == place_id)
        )
        return result.scalar_one_or_none()

    async def occupy(self, place_id: int) -> None:
        await self.session.execute(
            update(Place)
            .where(Place.id == place_id)
            .values(is_occupied=True)
        )

    async def release(self, place_id: int) -> None:
        await self.session.execute(
            update(Place)
            .where(Place.id == place_id)
            .values(is_occupied=False)
        )

    async def count_available(self, parking_id: int) -> int:
        result = await self.session.execute(
            select(func.count(Place.id)).where(
                Place.parking_id == parking_id,
                Place.is_occupied.is_(False),
                Place.is_available.is_(True),
            )
        )
        return result.scalar() or 0


class ParkingRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def find_by_id(self, parking_id: int) -> Parking | None:
        result = await self.session.execute(
            select(Parking).where(Parking.id == parking_id)
        )
        return result.scalar_one_or_none()

    async def find_active_by_id(self, parking_id: int) -> Parking | None:
        result = await self.session.execute(
            select(Parking).where(
                Parking.id == parking_id,
                Parking.is_active.is_(True),
            )
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> Sequence[Parking]:
        result = await self.session.execute(
            select(Parking).where(Parking.is_active.is_(True))
        )
        return result.scalars().all()

    async def create(self, name: str, address: str | None, total_places: int) -> Parking:
        parking = Parking(name=name, address=address, total_places=total_places)
        self.session.add(parking)
        await self.session.flush()
        return parking


class TicketRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def find_by_ticket_id(self, ticket_id: str) -> Ticket | None:
        result = await self.session.execute(
            select(Ticket).where(Ticket.ticket_id == ticket_id)
        )
        return result.scalar_one_or_none()

    async def find_active_ticket_for_vehicule(self, vehicule_id: int) -> Ticket | None:
        result = await self.session.execute(
            select(Ticket).where(
                Ticket.vehicule_id == vehicule_id,
                Ticket.status == "active",
            ).limit(1)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        ticket_id: str,
        vehicule_id: int,
        place_id: int,
        entry_time: datetime,
        telephone: str | None = None,
        email: str | None = None,
        reservation_time: int | None = None,
    ) -> Ticket:
        ticket = Ticket(
            ticket_id=ticket_id,
            vehicule_id=vehicule_id,
            place_id=place_id,
            entry_time=entry_time,
            telephone=telephone,
            email=email,
            reservation_time=reservation_time,
            status="active",
        )
        self.session.add(ticket)
        await self.session.flush()
        return ticket

    async def update_exit(
        self,
        ticket_id: str,
        exit_time: datetime,
        duration_minutes: int,
        amount: float,
    ) -> Ticket | None:
        ticket = await self.find_by_ticket_id(ticket_id)
        if ticket is None:
            return None
        ticket.exit_time = exit_time
        ticket.duration_minutes = duration_minutes
        ticket.amount = amount
        await self.session.flush()
        return ticket

    async def mark_paid(
        self,
        ticket_id: str,
        payment_method: str,
    ) -> Ticket | None:
        ticket = await self.find_by_ticket_id(ticket_id)
        if ticket is None:
            return None
        ticket.status = "paid"
        ticket.is_paid = True
        ticket.payment_method = payment_method
        await self.session.flush()
        return ticket

    async def get_all_tickets(self) -> Sequence[Ticket]:
        result = await self.session.execute(
            select(Ticket).options(
                selectinload(Ticket.vehicule),
                selectinload(Ticket.place).selectinload(Place.parking),
            ).order_by(Ticket.entry_time.desc())
        )
        return result.scalars().all()

    async def get_active_tickets(self) -> Sequence[Ticket]:
        result = await self.session.execute(
            select(Ticket).where(Ticket.status == "active")
        )
        return result.scalars().all()

    async def count_active(self) -> int:
        result = await self.session.execute(
            select(func.count(Ticket.id)).where(Ticket.status == "active")
        )
        return result.scalar() or 0


class EmployeeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def find_by_employee_id(self, employee_id: str) -> Employee | None:
        result = await self.session.execute(
            select(Employee).where(Employee.employee_id == employee_id)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        employee_id: str,
        name: str,
        email: str,
        password_hash: str,
        role: str,
        parking_id: int | None = None,
        is_active: bool = True,
        validation_status: str = "approved",
    ) -> Employee:
        employee = Employee(
            employee_id=employee_id, name=name, email=email,
            password_hash=password_hash, role=role, parking_id=parking_id,
            is_active=is_active, validation_status=validation_status,
        )
        self.session.add(employee)
        await self.session.flush()
        return employee

    async def get_all(self) -> Sequence[Employee]:
        result = await self.session.execute(select(Employee))
        return result.scalars().all()

    async def get_pending(self) -> Sequence[Employee]:
        result = await self.session.execute(
            select(Employee).where(Employee.validation_status == "pending")
        )
        return result.scalars().all()

    async def update(
        self,
        employee_id: str,
        name: str | None = None,
        email: str | None = None,
        role: str | None = None,
        parking_id: int | None = None,
        is_active: bool | None = None,
        password_hash: str | None = None,
        validation_status: str | None = None,
    ) -> Employee | None:
        emp = await self.find_by_employee_id(employee_id)
        if emp is None:
            return None
        if name is not None:
            emp.name = name
        if email is not None:
            emp.email = email
        if role is not None:
            emp.role = role
        if parking_id is not None:
            emp.parking_id = parking_id
        if is_active is not None:
            emp.is_active = is_active
        if password_hash is not None:
            emp.password_hash = password_hash
        if validation_status is not None:
            emp.validation_status = validation_status
        await self.session.flush()
        return emp

    async def delete(self, employee_id: str) -> bool:
        emp = await self.find_by_employee_id(employee_id)
        if emp is None:
            return False
        await self.session.delete(emp)
        await self.session.flush()
        return True
