import type { Parking } from "@shared/types/parking";
import api from "./api";

export async function getParkings(): Promise<Parking[]> {
  const res = await api.get("/api/parkings");
  return res.data;
}

export interface Employee {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  role: string;
  parking_id: number | null;
  is_active: boolean;
  validation_status: string;
}

export async function getEmployees(): Promise<Employee[]> {
  const res = await api.get("/api/admin/agents");
  return res.data;
}

export async function getPendingEmployees(): Promise<Employee[]> {
  const res = await api.get("/api/admin/pending");
  return res.data;
}

export async function createEmployee(data: {
  employee_id: string; name: string; email: string;
  password: string; role: string; parking_id?: number | null;
}): Promise<Employee> {
  const res = await api.post("/api/admin/agents", data);
  return res.data;
}

export async function updateEmployee(employee_id: string, data: {
  name?: string; email?: string; password?: string;
  role?: string; parking_id?: number | null; is_active?: boolean;
}): Promise<Employee> {
  const res = await api.put(`/api/admin/agents/${employee_id}`, data);
  return res.data;
}

export async function deleteEmployee(employee_id: string): Promise<void> {
  await api.delete(`/api/admin/agents/${employee_id}`);
}

export async function approveEmployee(employee_id: string): Promise<Employee> {
  const res = await api.post(`/api/admin/agents/${employee_id}/approve`);
  return res.data;
}

export async function rejectEmployee(employee_id: string): Promise<void> {
  await api.post(`/api/admin/agents/${employee_id}/reject`);
}

export async function createParking(data: {
  name: string; address?: string; total_places: number;
}): Promise<Parking> {
  const res = await api.post("/api/admin/parkings", data);
  return res.data;
}
