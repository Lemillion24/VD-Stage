export interface Parking {
  id: number;
  name: string;
  address: string | null;
  total_places: number;
  available_places: number;
  is_active: boolean;
}

export interface Place {
  id: number;
  place_number: string;
  parking_id: number;
  place_type: string;
  is_occupied: boolean;
  is_available: boolean;
}

export interface TarifInfo {
  tarif_horaire: number;
  tarif_journalier: number;
  delai_grace_minutes: number;
  taxe_parking: number;
  description: string;
}
