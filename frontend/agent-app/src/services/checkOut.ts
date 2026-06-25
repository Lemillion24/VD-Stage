import type { CheckOutRequest, CheckOutResponse } from "@shared/types/ticket";
import api from "./api";

export async function getCheckOutAmount(
  data: CheckOutRequest,
): Promise<CheckOutResponse> {
  const response = await api.post<CheckOutResponse>("/api/check-out", data);
  return response.data;
}
