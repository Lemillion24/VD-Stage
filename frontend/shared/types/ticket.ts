export interface CheckInRequest {
  plate_number: string;
  parking_id: number;
  vehicle_type?: string;
  owner_name?: string;
}

export interface CheckInResponse {
  success: boolean;
  ticket_id: string;
  place_number: string;
  entry_time: string;
  message: string;
}

export interface CheckOutRequest {
  ticket_id: string;
}

export interface CheckOutResponse {
  success: boolean;
  ticket_id: string;
  duration_minutes: number;
  amount: number;
  exit_time: string;
  message: string;
}

export interface PaymentRequest {
  ticket_id: string;
  payment_method: string;
}

export interface PaymentResponse {
  success: boolean;
  ticket_id: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  message: string;
}

export interface Ticket {
  ticket_id: string;
  plate_number: string;
  vehicle_type: string;
  place_number: string;
  parking_name: string;
  entry_time: string;
  exit_time: string | null;
  duration_minutes: number;
  amount: number;
  status: string;
  payment_method: string | null;
  is_paid: boolean;
}
