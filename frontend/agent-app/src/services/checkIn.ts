import type { CheckInRequest, CheckInResponse } from "@shared/types/ticket";
import api from "./api";

export async function checkIn(data: CheckInRequest): Promise<CheckInResponse> {
  const response = await api.post<CheckInResponse>("/api/check-in", data);
  return response.data;
}
