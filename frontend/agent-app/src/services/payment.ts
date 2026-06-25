import type { PaymentRequest, PaymentResponse } from "@shared/types/ticket";
import api from "./api";

export async function processPayment(
  data: PaymentRequest,
): Promise<PaymentResponse> {
  const response = await api.post<PaymentResponse>("/api/payment", data);
  return response.data;
}
