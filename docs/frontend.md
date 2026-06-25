# Frontend Documentation — Parking Management System

Trois applications React avec TypeScript, partageant des types communs.

---

## Structure

```
frontend/
├── shared/types/           # Types TypeScript partagés
│   ├── ticket.ts           # CheckIn, CheckOut, Payment, Ticket
│   ├── parking.ts          # Parking, Place, TarifInfo
│   └── vehicle.ts          # Vehicule, VehicleType enum
├── agent-app/              # Application Agent (port 3000)
├── client-app/             # Application Client (port 3001)
└── admin-app/              # Application Admin (port 3002)
```

## Stack Technique

| Technologie | Version |
|-------------|---------|
| React | 18 |
| TypeScript | 5 (strict) |
| Vite | 5 |
| React Query | 5 |
| React Router DOM | 6 |
| Axios | 1 |
| Tailwind CSS | 3 |

## Applications

### Agent App — `http://localhost:3000`

Utilisateurs : agents de parking

**Pages :**
| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Stats parkings, places dispo |
| `/check-in` | CheckIn | Formulaire d'entrée véhicule |
| `/check-out` | CheckOut | Calcul du montant |
| `/payment` | Payment | Traitement du paiement |
| `/tickets` | Tickets | Liste des tickets actifs |

**Services :** `checkIn.ts`, `checkOut.ts`, `payment.ts`
**Hooks :** `useCheckIn`, `useCheckOut`, `usePayment` (mutations React Query)

### Client App — `http://localhost:3001`

Utilisateurs : clients

**Pages :**
| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Saisie ID ticket |
| `/ticket/:ticketId` | TicketInfo | Détails du ticket |
| `/payment/:ticketId` | Payment | Paiement |

**Services :** `ticket.ts`, `payment.ts`

### Admin App — `http://localhost:3002`

Utilisateurs : administrateurs

**Pages :**
| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Stats globales |
| `/parkings` | Parkings | CRUD parkings |
| `/tickets` | Tickets | Liste avec filtre |
| `/employees` | Employés | Liste employés |
| `/tarifs` | Tarifs | Configuration tarifs |
| `/reports` | Reports | Export CSV |

**Services :** `admin.ts` (getParkings, getTickets, getEmployees, createParking)

## Conventions

- **Composants fonctionnels** React uniquement (pas de classes)
- **Hooks** pour la logique métier (useState, useEffect, useMutation)
- **React Query** pour la gestion d'état serveur
- **Axios** pour les appels HTTP
- **Tailwind CSS** pour le style
- **Variables d'environnement** : `VITE_API_BASE_URL`
- **TypeScript strict** : aucun `any`

## Build

```bash
cd frontend/agent-app   # ou client-app, admin-app
npm install
npm run dev             # Développement
npm run build           # Production
npm run preview         # Prévisualisation build
```
