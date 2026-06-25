# Security Audit Report — Parking Management System

**Date:** 2026-06-20
**Scope:** Full codebase (backend + frontend + Docker + configs)
**Methodology:** Static analysis (OWASP Top 10, dependency CVE scan, secrets detection)

---

## Scorecard

| Category | Status |
|----------|--------|
| Injection (SQL, Command, XSS, Path Traversal) | ✅ Clean (ORM-only, no shell exec, no innerHTML) |
| Secrets & Credentials | ❌ **5 Critical** — hardcoded passwords, committed .env, weak JWT secret |
| Authentication & Authorization | ❌ **2 Critical** — zero auth on any endpoint, no password hashing |
| Configuration (CORS, headers, debug) | ❌ **1 Critical + 1 High** — wildcard CORS, missing security headers |
| Error Handling | ⚠️ Medium — no global exception handler, potential stack leaks |
| Rate Limiting | ❌ High — none on any endpoint |
| Input Validation | ⚠️ Medium — weak Pydantic schemas, no vehicle type enum |
| Dependencies | ❌ **4 Critical** — req.txt out of sync, aiosqlite missing, CVEs in FastAPI/SQLAlchemy, Node 18 EOL |
| Transport Security | ❌ High — no HTTPS |

**Total: 12 Critical, 8 High, 8 Medium, 4 Low**

---

## CRITICAL Findings

### C1. No Authentication on Any API Endpoint
`backend/src/api/*.py` — every route. No middleware, no JWT dep, no login endpoint. The entire API is public.

**Fix:** Implement JWT auth service + `Depends()` on all routes.

### C2. No Password Hashing / Auth Dependencies Missing
`backend/requirements.txt` — `bcrypt`, `python-jose` absent. `Employee.password_hash` is stored/compared with zero hashing logic.

**Fix:** Add `bcrypt==4.2.0` and `python-jose[cryptography]==3.3.0` to requirements.

### C3. Weak JWT Secret in Code & `.env`
`backend/src/config/settings.py:48` — default `"your-secret-key-change-this"` (never changed).
`backend/.env:9` — committed JWT `dev-secret-key-change-in-production`.

**Fix:** Remove default, generate strong secret via env var with validator rejecting weak values.

### C4. Hardcoded DB Credentials in Source & Docker Compose
`backend/src/config/settings.py:23` — `parking:user` in default DATABASE_URL.
`docker/docker-compose.yml:8` — `POSTGRES_PASSWORD: user`.
`docker/docker-compose.yml:27` — `DATABASE_URL: postgresql://parking:user@postgres:5432/parking_db`.

**Fix:** Use Docker secrets / env vars with no defaults. Remove hardcoded credentials.

### C5. `.env` File Committed to Git
`backend/.env` — tracked despite `.gitignore` listing `.env`. Contains JWT secret and DB path.

**Fix:** `git rm --cached backend/.env`, add `/backend/.env` to `.gitignore`.

### C6. `requirements.txt` Severely Out of Sync
Versions listed vs installed — FastAPI 0.104.1 (installed 0.115.x), SQLAlchemy 2.0.23 (2.0.51), Pydantic 2.5.2 (2.13.4). Docker builds with vulnerable old versions.

**Fix:** Run `pip freeze > requirements.txt`. Pin minimally `fastapi>=0.115.0`, `sqlalchemy>=2.0.36`.

### C7. CVE-2024-24762 — FastAPI Open Redirect
`backend/requirements.txt` pins `fastapi==0.104.1`. Vulnerable to open redirect via `://` in URL path. Fixed in 0.109.2+.

**Fix:** Update to `fastapi>=0.115.0`.

### C8. CVE-2024-49730 — SQLAlchemy DoS
`backend/requirements.txt` pins `sqlalchemy==2.0.23`. Long crafted input causes excessive resource consumption. Fixed in 2.0.36+.

**Fix:** Update to `sqlalchemy>=2.0.36`.

### C9. `aiosqlite` Missing from Requirements
Not in `requirements.txt` but required for SQLite mode (`sqlite+aiosqlite://`). Docker build fails in SQLite dev mode.

**Fix:** Add `aiosqlite>=0.20.0` to requirements.

### C10. CORS Wildcard with Credentials
`backend/main.py:37-38` — `allow_origins=["*"]` + `allow_credentials=True`. Invalid per spec. Browsers reject credentialed requests with `*`.

**Fix:** Use explicit origins or remove `allow_credentials=True`.

### C11. Rate Limiting Absent on All Endpoints
No limit on check-in, check-out, payment, or ticket lookup. Short (6-char) ticket IDs vulnerable to brute-force enumeration.

**Fix:** Add `slowapi` middleware with per-IP limits (10 req/min on POST, 30 req/min on GET).

### C12. Node.js 18 Base Image EOL
All 3 frontend Dockerfiles use `node:18-alpine`. Node 18 EOL since Oct 2025, no more security patches.

**Fix:** Upgrade to `node:22-alpine`.

---

## HIGH Findings

| # | Finding | File | Line |
|---|---------|------|------|
| H1 | Missing security headers (CSP, HSTS, XFO, etc.) | `docker/nginx/nginx.conf` | 17-76 |
| H2 | Debug/reload in dev instructions | `backend/main.py` | 75 |
| H3 | Weak placeholders in `.env.example` | `backend/.env.example` | 1, 9 |
| H4 | Credentials exposed in deployment docs | `docs/deployment.md` | 102 |
| H5 | No HTTPS/TLS (nginx port 80 only) | `docker/nginx/nginx.conf` | 18 |
| H6 | No global exception handler — stack trace leak risk | `backend/main.py` | 46-61 |
| H7 | Overly permissive `.env` permissions (644) | `backend/.env` | — |
| H8 | PostgreSQL 14 approaching EOL (Nov 2026) | `docker/docker-compose.yml` | 2 |

---

## MEDIUM Findings

| # | Finding | Fix |
|---|---------|-----|
| M1 | No CSRF protection | Add `SameSite=Strict` or token middleware |
| M2 | Weak input validation in Pydantic schemas — `vehicle_type` accepts any string | Use `Literal["motorbike","compact","sedan","suv","truck"]` |
| M3 | `httpx` in production deps but only used for tests | Move to `requirements-dev.txt` |
| M4 | `serve` package in production Docker images | Replace with nginx |
| M5 | `vitest@0.34.6` multiple major versions behind | Update to `vitest@^2.0.0` |
| M6 | Swagger/OpenAPI exposed via nginx without auth | Protect `/docs` in production |
| M7 | Short 6-char ticket IDs (16M combinations) | Use full UUID hex |
| M8 | `PaymentRequest.payment_method` accepts any string | Use `PaymentMethod` enum |

---

## LOW Findings

| # | Finding |
|---|---------|
| L1 | Logging may expose internal paths (configured in settings.py) |
| L2 | No SSL/TLS for database connections (db_connection.py) |
| L3 | No statement timeout on database engine |
| L4 | Three identical frontend apps with duplicated deps |

---

## Action Plan

### Immediate (pre-production)
1. ✅ **Add authentication** — JWT middleware + login endpoint + `Depends()` on all routes
2. ✅ **Update & sync `requirements.txt`** — `pip freeze`, add `aiosqlite`, bump FastAPI/SQLAlchemy
3. ✅ **Remove committed `.env`** from git, add to `.gitignore`
4. ✅ **Fix CORS** — explicit origins, remove `allow_credentials=True` with wildcard
5. ✅ **Upgrade Node 18 → 22** in all 3 frontend Dockerfiles

### Short-term (this sprint)
6. Add rate limiting on POST endpoints (`slowapi`)
7. Add security headers in nginx config
8. Add HTTPS/TLS to nginx
9. Add global exception handler
10. Strengthen Pydantic input validation (enums, regex patterns)

### Long-term (next sprint)
11. Replace hardcoded Docker Compose credentials with secrets
12. Consolidate frontend apps or share deps
13. Plan PostgreSQL 14 → 16/17 migration
14. Move test deps to `requirements-dev.txt`
