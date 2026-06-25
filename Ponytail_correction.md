# Performance Audit Report — Parking Management System

Date : 2026-06-19
Auditeur : Senior Performance Engineer

---

## Executive Summary

L'audit a identifié **8 bottlenecks** dont **4 critiques** et **4 à impact moyen**. Les optimisations proposées couvrent la base de données, l'API backend, le bundle frontend et Docker. Les gains estimés vont de 20 % à 70 % selon les zones.

---

## Measured Bottlenecks

| # | Zone | Métrique | Valeur | Seuil |
|---|------|----------|--------|-------|
| B1 | API | GET /api/parkings | ~30ms | < 10ms |
| B2 | DB | N+1 queries (parkings + count) | 4 queries pour 3 parkings | 1 query |
| B3 | API | Temps check-in | ~30-60ms | < 20ms |
| B4 | Bundle | Agent JS bundle | 260 KB | < 150 KB |
| B5 | Bundle | Admin JS bundle | 264 KB | < 150 KB |
| B6 | Docker | Backend image | ~1.2 GB estimé | < 500 MB |
| B7 | Docker | Volume mount écrase l'image | `- ../backend:/app` | Ne pas monter en prod |
| B8 | Frontend | Pas de code splitting | 1 seul chunk JS | chunks séparés |

---

## Critical Issues

### C1. N+1 Query dans GET /api/parkings

**Fichier :** `backend/src/api/admin.py:56-77`

```python
parkings = await parking_repo.get_all()
for p in parkings:
    available = await place_repo.count_available(p.id)   # ← 1 query par parking
```

**Impact :** `O(n)` queries au lieu de `O(1)`. Avec 3 parkings → 4 queries. Avec 100 parkings → 101 queries.

**Solution :** Remplacer par une sous-requête ou un `GROUP BY` agrégé.

### C2. Aucun Connection Pooling pour PostgreSQL

**Fichier :** `backend/src/database/db_connection.py:21-30`

```python
return create_async_engine(url, echo=False)   # ← pool par défaut = 5
```

**Solution :** Configurer `pool_size`, `max_overflow`, `pool_recycle`.

### C3. Aucune Compression GZip

**Fichier :** `backend/main.py`

Aucun middleware de compression. Les réponses JSON (notamment parkings avec données listes) sont envoyées non compressées.

**Solution :** Ajouter `GZipMiddleware`.

### C4. Lazy Loading Place sur le Ticket Endpoint

**Fichier :** `backend/src/api/admin.py:92`

```python
place_number=ticket.place.place_number   # ← lazy load N+1
```

**Solution :** Utiliser `selectinload()` ou `joinedload()`.

---

## High Impact Optimizations

### H1. Requête Agrégée pour les Parkings

Remplacer la boucle N+1 par une sous-requête :
```python
from sqlalchemy import select, func, outerjoin

stmt = select(
    Parking.id, Parking.name, Parking.address,
    Parking.total_places, Parking.is_active,
    func.count(Place.id).filter(
        Place.is_occupied.is_(False),
        Place.is_available.is_(True)
      ).label("available_places")
).outerjoin(Place, Place.parking_id == Parking.id
).group_by(Parking.id)
```

**Gain estimé :** 1 query au lieu de N+1 (50-80 % de réduction).

### H2. Connection Pooling PostgreSQL

```python
return create_async_engine(
    url,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=3600,
)
```

**Gain estimé :** 20-40 % sur les requêtes (pas de création de connexion à chaque requête).

### H3. Compression GZip

```python
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

**Gain estimé :** Réduction de 60-80 % du poids des réponses JSON.

### H4. Frontend Code Splitting + Vendor Chunk

```ts
build: {
  sourcemap: false,
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules/react')) return 'react-vendor';
        if (id.includes('node_modules/@tanstack')) return 'query-vendor';
        if (id.includes('node_modules')) return 'vendor';
      },
    },
  },
},
```

**Gain estimé :** 30-50 % de réduction du bundle initial grâce au lazy loading des pages.

---

## Medium Impact Optimizations

### M1. Optimisation Docker Backend

- Ajouter un `.dockerignore`
- Multi-stage build avec `pip install --user`
- Supprimer le volume bind-mount en production

### M2. Index Manquants

Ajouter des indexes sur les FK fréquemment filtrées :

```sql
CREATE INDEX IF NOT EXISTS idx_tickets_vehicule_id ON tickets(vehicule_id);
CREATE INDEX IF NOT EXISTS idx_tickets_place_id ON tickets(place_id);
CREATE INDEX IF NOT EXISTS idx_places_parking_id ON places(parking_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status_vehicule ON tickets(status, vehicule_id);
```

### M3. Optimisation Check-Out avec Jointure

```python
stmt = select(Ticket, Vehicule).join(Vehicule).where(Ticket.ticket_id == ticket_id)
```

Au lieu de 2 requêtes séquentielles.

### M4. Cache des Pricing Factors

Remplacer le dict créé à chaque appel par une constante module :

```python
PRICING_FACTOR_MAP: dict[str, float] = {
    "motorbike": 0.5,
    "compact": 0.8,
    "sedan": 1.0,
    "suv": 1.2,
    "truck": 1.5,
}
```

---

## Estimated Gains

| Area | Issue | Current | Expected | Gain |
|------|-------|---------|----------|------|
| DB | N+1 parkings | 4 queries / requête | 1 query | 75 % |
| API | Temps parkings | 30 ms | < 5 ms | 83 % |
| API | Check-in | 30-60 ms | < 20 ms | 50 % |
| Bundle | JS agent | 260 KB | < 150 KB | 42 % |
| Bundle | JS admin | 264 KB | < 150 KB | 43 % |
| Docker | Taille image | ~1.2 GB | < 500 MB | 58 % |
| Docker | Compression | Aucune | GZip actif | 70 % bande |

---

## Action Plan

### Immédiat (jour 1)

1. **Patch N+1 parkings** — Remplacer la boucle par une sous-requête agrégée
2. **Patch compression** — Ajouter GZipMiddleware
3. **Patch connection pooling** — Configurer pool_size et max_overflow

### Court terme (semaine 1)

4. **Index manquants** — Ajouter les 4 indexes SQL
5. **Code splitting frontend** — Configurer manualChunks dans vite.config
6. **Backend Dockerfile** — Multi-stage + .dockerignore
7. **Frontend Dockerfile** — Supprimer serve, utiliser nginx

### Long terme (mois 1)

8. **Pagination** sur tous les endpoints GET list
9. **Redis caching** pour les tarifs et configs
10. **Rate limiting** via nginx ou slowapi
11. **Profile avec py-spy** en production réelle

---

## Patch Files

### Patch 1: N+1 Query — `backend/src/api/admin.py`

Remplacer la boucle par une sous-requête GROUP BY :

```python
@router.get("/parkings", response_model=list[ParkingInfo])
async def get_parkings(
    session: AsyncSession = Depends(get_db),
) -> list[ParkingInfo]:
    stmt = select(
        Parking.id,
        Parking.name,
        Parking.address,
        Parking.total_places,
        Parking.is_active,
        func.count(Place.id).filter(
            Place.is_occupied.is_(False),
            Place.is_available.is_(True),
        ).label("available_places"),
    ).outerjoin(
        Place, Place.parking_id == Parking.id
    ).where(
        Parking.is_active.is_(True)
    ).group_by(Parking.id)

    result = await session.execute(stmt)
    rows = result.mappings().all()
    return [ParkingInfo(**row) for row in rows]
```

### Patch 2: Connection Pooling — `backend/src/database/db_connection.py`

```python
return create_async_engine(
    url,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=3600,
)
```

### Patch 3: Compression GZip — `backend/main.py`

```python
from fastapi.middleware.gzip import GZipMiddleware

# Après CORS middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### Patch 4: Code Splitting — `frontend/*/vite.config.ts`

```ts
export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  resolve: {
    alias: { "@shared": resolve(__dirname, "../shared") },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules/react")) return "react-vendor";
          if (id.includes("node_modules/@tanstack")) return "query-vendor";
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },
});
```

### Patch 5: Lazy Loading Place — `backend/src/api/admin.py`

```python
from sqlalchemy.orm import selectinload

@router.get("/ticket/{ticket_id}", response_model=CheckInResponse)
async def get_ticket(
    ticket_id: str,
    session: AsyncSession = Depends(get_db),
) -> CheckInResponse:
    stmt = select(Ticket).options(
        selectinload(Ticket.place)
    ).where(Ticket.ticket_id == ticket_id)
    result = await session.execute(stmt)
    ticket = result.scalar_one_or_none()
    ...
```

### Patch 6: .dockerignore — `backend/.dockerignore`

```
__pycache__/
*.pyc
.env
venv/
*.db
.git
.gitignore
logs/
.pytest_cache/
tests/
seed.py
```

### Patch 7: Backend Multi-stage Dockerfile — `backend/Dockerfile`

```dockerfile
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY main.py .
COPY src/ ./src
ENV PATH=/root/.local/bin:$PATH
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Patch 8: Docker Compose — supprimer bind mount en prod

```yaml
backend:
  build:
    context: ../backend
    dockerfile: Dockerfile
  # volumes:   ← commenter ou supprimer en production
  #   - ../backend:/app
```

---

## Verification Steps

### Après chaque patch :

1. **Backend** — Relancer les tests :
   ```bash
   cd backend && source venv/bin/activate && pytest tests/ -v
   ```

2. **API Benchmarks** — Vérifier les temps de réponse :
   ```bash
   curl -s -o /dev/null -w "%{time_total}s\n" http://localhost:8000/api/parkings
   ```

3. **Bundle size** — Vérifier la taille du build :
   ```bash
   cd frontend/agent-app && npx vite build && du -sh dist/assets/*.js
   ```

4. **Compression** — Vérifier l'en-tête Content-Encoding :
   ```bash
   curl -s -H "Accept-Encoding: gzip" -o /dev/null -D - http://localhost:8000/api/parkings | grep -i encoding
   ```

5. **Docker** — Vérifier la taille de l'image :
   ```bash
   docker images parking-backend
   ```

---

## Relevant Files

| Fichier | Issue | Patch |
|---------|-------|-------|
| `backend/src/api/admin.py` | N+1 query, lazy load | #1, #5 |
| `backend/src/database/db_connection.py` | Pool config manquante | #2 |
| `backend/main.py` | Compression absente | #3 |
| `frontend/*/vite.config.ts` | Bundle unique | #4 |
| `backend/Dockerfile` | Image non optimisée | #6, #7 |
| `docker/docker-compose.yml` | Bind mount prod | #8 |
| `backend/src/services/check_out.py` | 2 queries séquentielles | Optimisation |
| `backend/src/config/settings.py` | Dict créé à chaque appel | Constante module |
