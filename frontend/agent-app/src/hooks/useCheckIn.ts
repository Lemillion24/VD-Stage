import { useMutation } from "@tanstack/react-query";
import type { CheckInRequest, CheckInResponse } from "@shared/types/ticket";
import { checkIn } from "../services/checkIn";

export function useCheckIn() {
  return useMutation<CheckInResponse, Error, CheckInRequest>({
    mutationFn: checkIn,
  });
}
