# Déploiement — Parking Management System

---

## Avec Docker (Production)

### Prérequis
- Docker 24+
- Docker Compose V2

### Lancer tous les services

```bash
cd docker
docker compose up --build
```

### Services exposés

| Service | URL | Port Hôte |
|---------|-----|-----------|
| Nginx (Reverse Proxy) | http://localhost:80 | 80 |
| API Backend | http://localhost:8000 | 8000 |
| Agent App | http://localhost:3000 | 3000 |
| Client App | http://localhost:3001 | 3001 |
| Admin App | http://localhost:3002 | 3002 |
| PostgreSQL | localhost:5432 | 5432 |

### Via Nginx (recommandé)

Une fois lancé, tout est accessible via http://localhost:

| Chemin | Service |
|--------|---------|
| `/api/` | Backend API |
| `/agent/` | Agent App |
| `/client/` | Client App |
| `/admin/` | Admin App |
| `/docs` | OpenAPI Swagger |

### Arrêter

```bash
cd docker
docker compose down
```

Pour supprimer aussi les volumes (données DB) :

```bash
docker compose down -v
```

---

## Sans Docker (Développement)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Éditer DATABASE_URL dans .env
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

Ouvrir 3 terminaux :

```bash
# Terminal 1 - Agent App
cd frontend/agent-app
npm install
npm run dev

# Terminal 2 - Client App
cd frontend/client-app
npm install
npm run dev

# Terminal 3 - Admin App
cd frontend/admin-app
npm install
npm run dev
```

### Base de données

**PostgreSQL requis** pour la production.  
**SQLite** accepté pour le développement.

---

## Variables d'Environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| DATABASE_URL | Connexion PostgreSQL | postgresql://parking:user@localhost/parking_db |
| APP_NAME | Nom de l'application | Parking Management System |
| LOG_LEVEL | Niveau de log (loguru) | INFO |
| TARIF_HORAIRE | Tarif par heure (FC) | 500.0 |
| TARIF_JOURNALIER | Tarif max par jour (FC) | 3000.0 |
| DELAI_GRACE | Minutes gratuites | 15 |
| TAXE_PARKING | Taxe (décimal) | 0.10 |
| JWT_SECRET | Clé secrète JWT | (à changer en prod) |
| JWT_ALGORITHM | Algorithme JWT | HS256 |
| VITE_API_BASE_URL | URL API (frontend) | http://localhost:8000 |

---

## Architecture Docker

```
┌─────────────────────────────────────────────────────────┐
│                        Nginx (:80)                       │
│  /api → backend:8000 /agent → agent:3000 / ...          │
├──────────┬──────────┬──────────┬────────────┬────────────┤
│ backend  │  agent   │  client  │   admin    │ postgres   │
│ :8000    │  :3000   │  :3000   │   :3000    │  :5432     │
│ FastAPI  │  serve   │  serve   │   serve    │  PG 14     │
└──────────┴──────────┴──────────┴────────────┴────────────┘
```

## Tests

```bash
# Backend
cd backend && source venv/bin/activate
pytest tests/ -v --cov=src --cov-report=term-missing

# Frontend (chaque app)
cd frontend/agent-app && npx vitest
```

## Stack Produit

- **Python 3.11** + FastAPI + SQLAlchemy 2.0 (async)
- **PostgreSQL 14** (via asyncpg)
- **React 18** + TypeScript 5 + Vite 5
- **Nginx** (reverse proxy)
- **Docker** + docker-compose
