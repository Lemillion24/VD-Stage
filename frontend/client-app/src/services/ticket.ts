import type { CheckInResponse } from "@shared/types/ticket";
import api from "./api";

export async function getTicket(ticketId: string): Promise<CheckInResponse> {
  const response = await api.get<CheckInResponse>(`/api/ticket/${ticketId}`);
  return response.data;
}
