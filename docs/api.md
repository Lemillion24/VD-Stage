# API Documentation — Parking Management System

Base URL: `http://localhost:8000`

---

## Endpoints

### GET /

Info API.

**Response:**
```json
{
  "name": "Parking Management System",
  "version": "1.0.0",
  "docs": "/docs"
}
```

---

### POST /api/check-in

Entrée d'un véhicule dans le parking.

**Request:**
```json
{
  "plate_number": "ABC123",
  "parking_id": 1,
  "vehicle_type": "sedan",
  "owner_name": "John Doe"
}
```

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| plate_number | string | Oui | Numéro de plaque (1-20 car.) |
| parking_id | integer | Oui | ID du parking |
| vehicle_type | string | Non (def: sedan) | Type: motorbike, compact, sedan, suv, truck |
| owner_name | string | Non | Nom du propriétaire |

**Response 200:**
```json
{
  "success": true,
  "ticket_id": "TKT-2024-001",
  "place_number": "P-101",
  "entry_time": "2024-01-15T10:30:00",
  "message": "Véhicule entré au Parking Central"
}
```

**Erreurs:**
- `400` — Véhicule déjà dans le parking
- `400` — Parking plein
- `404` — Parking introuvable

---

### POST /api/check-out

Calcul du montant pour la sortie.

**Request:**
```json
{
  "ticket_id": "TKT-2024-001"
}
```

**Response 200:**
```json
{
  "success": true,
  "ticket_id": "TKT-2024-001",
  "duration_minutes": 45,
  "amount": 750.0,
  "exit_time": "2024-01-15T11:15:00",
  "message": "Montant à payer: 750.00 FC"
}
```

**Erreurs:**
- `404` — Ticket introuvable
- `400` — Ticket déjà payé

---

### POST /api/payment

Traitement du paiement.

**Request:**
```json
{
  "ticket_id": "TKT-2024-001",
  "payment_method": "cash"
}
```

| Champ | Valeurs |
|-------|---------|
| payment_method | cash, card, mobile_money, qr_code |

**Response 200:**
```json
{
  "success": true,
  "ticket_id": "TKT-2024-001",
  "amount": 750.0,
  "payment_method": "cash",
  "transaction_id": "TXN-2024-001",
  "message": "Paiement de 750.00 FC accepté"
}
```

**Erreurs:**
- `400` — Méthode de paiement invalide
- `404` — Ticket introuvable
- `400` — Ticket déjà payé

---

### GET /api/tarifs

Tarifs en vigueur.

**Response 200:**
```json
{
  "tarif_horaire": 500.0,
  "tarif_journalier": 3000.0,
  "delai_grace_minutes": 15,
  "taxe_parking": 0.1,
  "description": "500 FC/heure, 3000 FC/jour max, 15 min gratuites, 10% taxe incluse"
}
```

---

### GET /api/parkings

Liste des parkings avec places disponibles.

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Parking Central",
    "address": "Avenue de la République",
    "total_places": 20,
    "available_places": 15,
    "is_active": true
  }
]
```

---

### GET /api/ticket/{ticket_id}

Informations d'un ticket.

**Response 200:**
```json
{
  "success": true,
  "ticket_id": "TKT-2024-001",
  "place_number": "P-101",
  "entry_time": "2024-01-15T10:30:00"
}
```

**Erreurs:**
- `404` — Ticket introuvable

---

## Règles de Calcul

```
Montant = ceil(durée_min / 60) × 500 × coefficient × 1.10
Plafond = 3 000 FC/jour
```

| Véhicule | Coefficient |
|----------|-------------|
| Moto | ×0.5 |
| Compacte | ×0.8 |
| Berline | ×1.0 |
| SUV | ×1.2 |
| Camion | ×1.5 |

Délai de grâce : **15 minutes** gratuites.

## Codes d'Erreur

| Status | Exception | Description |
|--------|-----------|-------------|
| 400 | ParkingFullException | Parking complet |
| 400 | VehicleAlreadyInsideException | Véhicule déjà entré |
| 400 | TicketAlreadyPaidException | Ticket déjà réglé |
| 400 | InvalidPaymentMethodException | Mode de paiement inconnu |
| 404 | TicketNotFoundException | Ticket inexistant |
| 404 | SpotNotFoundException | Place introuvable |
| 500 | PaymentFailedException | Échec du paiement |
