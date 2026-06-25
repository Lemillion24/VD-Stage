# Parking Management System

Système complet de gestion de parking avec API REST (FastAPI) et 3 applications frontend (React + TypeScript).

**Auteur :** Harry'son BAGEYA  
**Statut :** ✅ 22/22 étapes terminées

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Nginx (Reverse Proxy)                │
├──────────┬──────────┬──────────┬──────────────┬─────────────┤
│ Backend  │   Agent  │  Client  │    Admin     │  PostgreSQL │
│ :8000    │  :3000   │  :3001   │    :3002     │   :5432     │
│ FastAPI  │  React   │  React   │    React     │             │
└──────────┴──────────┴──────────┴──────────────┴─────────────┘
```

## Structure du Projet

```
/
├── backend/           API REST — FastAPI + SQLAlchemy async
│   ├── src/config/    Pydantic Settings
│   ├── src/constants/ Enums (paiement, véhicules)
│   ├── src/database/  DB connection + Repositories
│   ├── src/models/    ORM (Parking, Place, Vehicule, Ticket, Employee)
│   ├── src/schemas/   Pydantic Request/Response
│   ├── src/services/  Business logic (CheckIn, CheckOut, Payment)
│   ├── src/utils/     Helpers (currency, datetime)
│   ├── src/api/       Routes FastAPI
│   ├── tests/         23 tests ✅
│   └── main.py        Point d'entrée
│
├── frontend/
│   ├── shared/types/  Types TypeScript partagés
│   ├── agent-app/     Port 3000 — Agent parking
│   ├── client-app/    Port 3001 — Client
│   └── admin-app/     Port 3002 — Administrateur
│
├── docker/
│   ├── docker-compose.yml   6 services
│   └── nginx/nginx.conf     Reverse proxy
│
├── docs/
│   ├── api.md           Documentation API
│   ├── frontend.md      Documentation frontend
│   └── deployment.md    Déploiement Docker
│
├── ErrorsLog.md         Journal des erreurs rencontrées
├── LOG.md               Journal d'avancement
└── README.md            Présentation du projet
```

## Tech Stack

| Composant    | Technologie                          |
|-------------|--------------------------------------|
| Backend     | Python 3.11+, FastAPI 0.104          |
| ORM         | SQLAlchemy 2.0 + asyncpg             |
| Database    | PostgreSQL 14 (SQLite en dev)         |
| Frontend    | TypeScript 5.3, React 18, Vite 5     |
| HTTP Client | Axios 1.6 + React Query 5            |
| Auth        | JWT (python-jose) + RBAC             |
| Styling     | Tailwind CSS 3                       |
| Logging     | loguru                               |
| Tests       | pytest 23 tests / Vitest             |
| Container   | Docker + docker-compose + Nginx      |

## Règles Métier

- **15 minutes** gratuites (délai de grâce)
- **500 FC** / heure (tarif horaire)
- **3 000 FC** / jour max (tarif journalier)
- **10%** taxe parking incluse
- Coefficient multiplicateur selon type de véhicule :
  - Motorbike: ×0.5 · Compact: ×0.8 · Sedan: ×1.0 · SUV: ×1.2 · Truck: ×1.5

## Installation et Lancement

### Prérequis
- Python 3.11+, Node.js 18+
- PostgreSQL 14 ou Docker

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

API → http://localhost:8000 | Docs → http://localhost:8000/docs

### 2. Frontend (3 terminaux)

```bash
# Agent App (port 3000)
cd frontend/agent-app && npm install && npm run dev

# Client App (port 3001)
cd frontend/client-app && npm install && npm run dev

# Admin App (port 3002)
cd frontend/admin-app && npm install && npm run dev
```

### 3. Données de test (seed)

```bash
cd backend && source venv/bin/activate
python seed.py
```

Crée 3 parkings (Central, Gare, Marché) avec 45 places.

### 4. Docker (production)

```bash
cd docker
docker compose up --build
```

Tout est accessible via http://localhost.

## Tests

```bash
cd backend && source venv/bin/activate
pytest tests/ -v           # 23 tests ✅
```

## Endpoints API

| Méthode | Path                    | Description                |
|---------|-------------------------|----------------------------|
| GET     | `/`                     | Info API                   |
| POST    | `/api/check-in`         | Entrée véhicule            |
| POST    | `/api/check-out`        | Calcul montant sortie      |
| POST    | `/api/payment`          | Traitement paiement        |
| GET     | `/api/tarifs`           | Tarifs en vigueur          |
| GET     | `/api/parkings`         | Parkings + places dispo.   |
| GET     | `/api/ticket/{id}`      | Info ticket                |

## Documentation Complémentaire

- [Journal d'avancement](LOG.md)
- [Journal des erreurs](ErrorsLog.md)
- [Documentation API](docs/api.md)
- [Documentation Frontend](docs/frontend.md)
- [Déploiement](docs/deployment.md)
