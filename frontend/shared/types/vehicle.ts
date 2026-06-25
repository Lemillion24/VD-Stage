export interface Vehicule {
  id: number;
  plate_number: string;
  vehicle_type: string;
  owner_name: string | null;
  is_active: boolean;
  created_at: string;
}

export enum VehicleType {
  MOTORBIKE = "motorbike",
  COMPACT = "compact",
  SEDAN = "sedan",
  SUV = "suv",
  TRUCK = "truck",
}

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  motorbike: "Moto",
  compact: "Compacte",
  sedan: "Berline",
  suv: "SUV",
  truck: "Camion",
};

export const VEHICLE_TYPE_OPTIONS = Object.values(VehicleType).map((v) => ({
  value: v,
  label: VEHICLE_TYPE_LABELS[v] ?? v,
}));
