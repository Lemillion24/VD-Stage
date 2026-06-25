from __future__ import annotations

import time
from hashlib import pbkdf2_hmac
from secrets import token_hex

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.db_connection import get_db
from src.models.employee import Employee


def _hash_password(password: str) -> str:
    salt = token_hex(16)
    h = pbkdf2_hmac("sha256", password.encode(), salt.encode(), 600_000).hex()
    return f"{salt}:{h}"


def _verify_password(password: str, stored: str) -> bool:
    salt, h = stored.split(":", 1)
    return pbkdf2_hmac("sha256", password.encode(), salt.encode(), 600_000).hex() == h


_LOGIN_ATTEMPTS: dict[str, list[float]] = {}
_LOCKOUT_TIME = 300
_MAX_ATTEMPTS = 10

def _check_login_rate_limit(ip: str) -> None:
    now = time.time()
    entry = _LOGIN_ATTEMPTS.get(ip, [])
    entry = [t for t in entry if now - t < _LOCKOUT_TIME]
    if len(entry) >= _MAX_ATTEMPTS:
        raise HTTPException(429, "Trop de tentatives. Réessayez dans 5 minutes.")
    entry.append(now)
    _LOGIN_ATTEMPTS[ip] = entry


# ponytail: dev users for local dev + tests. Replace with DB-only in production.
_DEV_USERS: dict[str, dict[str, str]] = {
    "admin": {"password": _hash_password("admin123"), "role": "admin"},
    "agent": {"password": _hash_password("agent123"), "role": "agent"},
    "super-admin": {"password": _hash_password("supadmin123"), "role": "super-admin"},
}

# ponytail: in-memory token store, add Redis when >1 server
_tokens: dict[str, tuple[str, float]] = {}
TOKEN_TTL = 86400

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1)


@router.post("/login")
async def login(body: LoginRequest, request: Request, response: Response, session: AsyncSession = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    _check_login_rate_limit(ip)

    role: str | None = None

    # Try DB first
    try:
        result = await session.execute(select(Employee).where(
            Employee.employee_id == body.username,
            Employee.is_active.is_(True),
            Employee.validation_status == "approved",
        ))
        emp = result.scalar_one_or_none()
        if emp and _verify_password(body.password, emp.password_hash):
            role = emp.role
    except Exception:
        pass  # fall through to dev users

    # Fall back to dev users
    if role is None:
        dev = _DEV_USERS.get(body.username)
        if dev and _verify_password(body.password, dev["password"]):
            role = dev["role"]

    if role is None:
        raise HTTPException(401, "Identifiants invalides")

    token = token_hex(32)
    _tokens[token] = (body.username, time.time())

    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=TOKEN_TTL,
    )
    return {"token": token, "role": role}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("token")
    return {"message": "Déconnecté"}


async def get_authenticated(
    request: Request = None,
    authorization: str | None = Header(None),
):
    token_key: str | None = None

    cookie = request.cookies.get("token") if request else None
    if cookie:
        token_key = cookie

    if not token_key and authorization and authorization.startswith("Bearer "):
        token_key = authorization.removeprefix("Bearer ")

    if not token_key:
        raise HTTPException(401, "Authentification requise")

    entry = _tokens.get(token_key)
    if not entry:
        raise HTTPException(401, "Token invalide")

    username, created_at = entry
    if time.time() - created_at > TOKEN_TTL:
        _tokens.pop(token_key, None)
        raise HTTPException(401, "Token expiré")

    return {"username": username, "role": _get_user_role(username)}


def _get_user_role(username: str) -> str:
    if username in _DEV_USERS:
        return _DEV_USERS[username]["role"]
    return "agent"


def require_role(*roles: str):
    async def _check(user: dict = Depends(get_authenticated)):
        if user["role"] not in roles:
            raise HTTPException(403, "Accès refusé : rôle insuffisant")
        return user
    return _check
