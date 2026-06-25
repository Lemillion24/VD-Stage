import { useMutation } from "@tanstack/react-query";
import type { PaymentRequest, PaymentResponse } from "@shared/types/ticket";
import { processPayment } from "../services/payment";

export function usePayment() {
  return useMutation<PaymentResponse, Error, PaymentRequest>({
    mutationFn: processPayment,
  });
}
