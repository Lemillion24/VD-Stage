import { useMutation } from "@tanstack/react-query";
import type { CheckOutRequest, CheckOutResponse } from "@shared/types/ticket";
import { getCheckOutAmount } from "../services/checkOut";

export function useCheckOut() {
  return useMutation<CheckOutResponse, Error, CheckOutRequest>({
    mutationFn: getCheckOutAmount,
  });
}
