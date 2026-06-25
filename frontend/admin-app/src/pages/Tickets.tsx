import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

interface TicketInfo {
  ticket_id: string;
  plate_number: string;
  parking_name: string;
  place_number: string;
  entry_time: string;
  amount: number;
  status: string;
  owner_name: string | null;
  telephone: string | null;
  email: string | null;
  reservation_time: number | null;
}

const STATUS_COLORS: Record<string, string> = {
  active: "border-swiss-text text-swiss-text",
  paid: "border-swiss-border text-swiss-muted",
};

export default function Tickets() {
  const [filter, setFilter] = useState("");

  const { data: tickets, isLoading } = useQuery<TicketInfo[]>({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      const res = await api.get("/api/tickets");
      return res.data;
    },
  });

  const filtered = tickets?.filter(
    (t) =>
      !filter ||
      t.ticket_id.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div>
      <div className="border-b border-swiss-border pb-4 mb-6">
        <h1 className="text-sm font-bold tracking-widest uppercase text-swiss-text">Tickets</h1>
      </div>

      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Rechercher par ID de ticket..."
        className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-4 py-2 mb-4 placeholder:text-swiss-muted focus:outline-none focus:border-swiss-accent"
      />

      {isLoading ? (
        <p className="text-xs text-swiss-muted">Chargement...</p>
      ) : (
        <div className="border border-swiss-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-swiss-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Ticket</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Plaque</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Parking</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Entree</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Montant</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-swiss-border">
              {filtered?.map((t) => (
                <tr key={t.ticket_id} className="hover:bg-swiss-neutral">
                  <td className="px-4 py-3 font-mono text-xs text-swiss-text">{t.ticket_id}</td>
                  <td className="px-4 py-3 text-xs text-swiss-text">{t.plate_number}</td>
                  <td className="px-4 py-3 text-xs text-swiss-muted">{t.parking_name}</td>
                  <td className="px-4 py-3 text-xs text-swiss-muted">{t.entry_time}</td>
                  <td className="px-4 py-3 text-xs">
                    {t.amount > 0
                      ? <span className="text-swiss-accent">{t.amount.toLocaleString()} FC</span>
                      : <span className="text-swiss-muted">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs border ${STATUS_COLORS[t.status] ?? "border-swiss-border text-swiss-muted"}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
