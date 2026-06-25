import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmployees, createEmployee, updateEmployee, deleteEmployee,
  approveEmployee, rejectEmployee,
} from "../services/admin";
import type { Employee } from "../services/admin";

const ROLE_COLORS: Record<string, string> = {
  "super-admin": "border-swiss-accent text-swiss-accent",
  admin: "border-swiss-text text-swiss-text",
  agent: "border-swiss-border text-swiss-muted",
};

const VALIDATION_COLORS: Record<string, string> = {
  approved: "text-swiss-text",
  pending: "text-swiss-accent",
  rejected: "text-swiss-red",
};

export default function Employees() {
  const role = localStorage.getItem("role");
  const isSuper = role === "super-admin";
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState({ employee_id: "", name: "", email: "", password: "", role: "agent", parking_id: "" });

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const createMut = useMutation({
    mutationFn: (d: typeof form) => createEmployee({
      employee_id: d.employee_id, name: d.name, email: d.email,
      password: d.password, role: d.role,
      parking_id: d.parking_id ? Number(d.parking_id) : null,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); resetForm(); },
  });

  const updateMut = useMutation({
    mutationFn: (d: { id: string; data: Partial<typeof form> }) =>
      updateEmployee(d.id, d.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); resetForm(); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
  });

  const approveMut = useMutation({
    mutationFn: approveEmployee,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
  });

  const rejectMut = useMutation({
    mutationFn: rejectEmployee,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ employee_id: "", name: "", email: "", password: "", role: "agent", parking_id: "" });
  };

  const handleEdit = (emp: Employee) => {
    setEditing(emp);
    setForm({ employee_id: emp.employee_id, name: emp.name, email: emp.email || "", password: "", role: emp.role, parking_id: emp.parking_id?.toString() || "" });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const payload: Record<string, string> = {};
      if (form.name !== editing.name) payload.name = form.name;
      if (form.email !== (editing.email || "")) payload.email = form.email;
      if (form.password) payload.password = form.password;
      if (form.role !== editing.role) payload.role = form.role;
      updateMut.mutate({ id: editing.employee_id, data: payload });
    } else {
      createMut.mutate(form);
    }
  };

  const pending = employees?.filter((e) => e.validation_status === "pending") || [];

  return (
    <div>
      <div className="flex justify-between items-center border-b border-swiss-border pb-4 mb-6">
        <h1 className="text-sm font-bold tracking-widest uppercase text-swiss-text">Employes</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="bg-swiss-accent text-white text-xs tracking-widest uppercase px-4 py-2 hover:opacity-90">
          {showForm ? "Annuler" : "+ Nouvel employe"}
        </button>
      </div>

      {pending.length > 0 && isSuper && (
        <div className="border border-swiss-accent p-4 mb-6">
          <p className="text-xs font-bold text-swiss-accent mb-2">{pending.length} validation(s) en attente</p>
          <div className="space-y-2">
            {pending.map((emp) => (
              <div key={emp.id} className="flex justify-between items-center border-b border-swiss-border pb-2">
                <div>
                  <span className="text-xs text-swiss-text font-medium">{emp.name}</span>
                  <span className="text-xs text-swiss-muted ml-2">({emp.employee_id})</span>
                  <span className="text-xs text-swiss-muted ml-2">{emp.role}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approveMut.mutate(emp.employee_id)}
                    className="text-xs border border-swiss-accent text-swiss-accent px-2 py-1 hover:bg-swiss-accent hover:text-white">
                    Approuver
                  </button>
                  <button onClick={() => rejectMut.mutate(emp.employee_id)}
                    className="text-xs border border-swiss-red text-swiss-red px-2 py-1 hover:bg-swiss-red hover:text-white">
                    Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-swiss-border p-6 mb-6 space-y-4">
          <div>
            <label className="block text-xs text-swiss-muted mb-1">Identifiant *</label>
            <input type="text" required value={form.employee_id} disabled={!!editing}
              onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
              className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 focus:outline-none focus:border-swiss-accent disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-xs text-swiss-muted mb-1">Nom *</label>
            <input type="text" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 focus:outline-none focus:border-swiss-accent" />
          </div>
          <div>
            <label className="block text-xs text-swiss-muted mb-1">Email *</label>
            <input type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 focus:outline-none focus:border-swiss-accent" />
          </div>
          <div>
            <label className="block text-xs text-swiss-muted mb-1">Mot de passe {editing && "(laisser vide pour conserver)"} *{!editing ? "" : ""}</label>
            <input type="password" value={form.password} required={!editing}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 focus:outline-none focus:border-swiss-accent" />
          </div>
          <div>
            <label className="block text-xs text-swiss-muted mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 focus:outline-none focus:border-swiss-accent">
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={createMut.isPending || updateMut.isPending}
            className="bg-swiss-accent text-white text-xs tracking-widest uppercase px-6 py-2 hover:opacity-90 disabled:opacity-30">
            {editing ? "Modifier" : "Creer"}
          </button>
          {!isSuper && editing && (
            <p className="text-xs text-swiss-accent mt-1">Les modifications seront activees apres validation par le super-admin.</p>
          )}
          {!isSuper && !editing && showForm && (
            <p className="text-xs text-swiss-accent mt-1">L'employe sera actif apres validation par le super-admin.</p>
          )}
        </form>
      )}

      {isLoading ? (
        <p className="text-xs text-swiss-muted">Chargement...</p>
      ) : (
        <div className="border border-swiss-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-swiss-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Nom</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Statut</th>
                {isSuper && <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-swiss-border">
              {employees?.map((emp) => (
                <tr key={emp.id} className="hover:bg-swiss-neutral">
                  <td className="px-4 py-3 font-mono text-xs text-swiss-text">{emp.employee_id}</td>
                  <td className="px-4 py-3 text-xs font-medium text-swiss-text">{emp.name}</td>
                  <td className="px-4 py-3 text-xs text-swiss-muted">{emp.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs border ${ROLE_COLORS[emp.role] ?? "border-swiss-border text-swiss-muted"}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={VALIDATION_COLORS[emp.validation_status] ?? "text-swiss-muted"}>
                      {emp.validation_status === "approved" ? (emp.is_active ? "Actif" : "Inactif") : emp.validation_status === "pending" ? "En attente" : "Rejete"}
                    </span>
                  </td>
                  {isSuper && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(emp)}
                          className="text-xs border border-swiss-border text-swiss-muted px-2 py-1 hover:border-swiss-text hover:text-swiss-text">
                          Editer
                        </button>
                        <button onClick={() => { if (confirm(`Supprimer ${emp.name}?`)) deleteMut.mutate(emp.employee_id); }}
                          className="text-xs border border-swiss-red text-swiss-red px-2 py-1 hover:bg-swiss-red hover:text-white">
                          Supprimer
                        </button>
                      </div>
                    </td>
                  )}
                  {!isSuper && (
                    <td className="px-4 py-3">
                      <button onClick={() => handleEdit(emp)}
                        className="text-xs border border-swiss-border text-swiss-muted px-2 py-1 hover:border-swiss-text hover:text-swiss-text">
                        Editer
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
