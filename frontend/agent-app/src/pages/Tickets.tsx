import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

interface TicketInfo {
  ticket_id: string;
  plate_number: string;
  parking_name: string;
  place_number: string;
  entry_time: string;
}

export default function Tickets() {
  const { data: tickets, isLoading } = useQuery<TicketInfo[]>({
    queryKey: ["active-tickets"],
    queryFn: async () => {
      const res = await api.get("/api/tickets");
      return res.data;
    },
  });

  return (
    <div>
      <div className="border-b border-swiss-border pb-4 mb-6">
        <h1 className="text-sm font-bold tracking-widest uppercase text-swiss-text">Tickets Actifs</h1>
      </div>

      {isLoading ? (
        <p className="text-xs text-swiss-muted">Chargement...</p>
      ) : !tickets || tickets.length === 0 ? (
        <div className="border border-swiss-border p-8">
          <p className="text-xs text-swiss-muted">Aucun ticket actif pour le moment</p>
        </div>
      ) : (
        <div className="border border-swiss-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-swiss-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Ticket</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Plaque</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Parking</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Place</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Entree</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-swiss-border">
              {tickets.map((ticket) => (
                <tr key={ticket.ticket_id} className="hover:bg-swiss-neutral">
                  <td className="px-4 py-3 font-mono text-xs text-swiss-text">{ticket.ticket_id}</td>
                  <td className="px-4 py-3 text-xs text-swiss-text">{ticket.plate_number}</td>
                  <td className="px-4 py-3 text-xs text-swiss-muted">{ticket.parking_name}</td>
                  <td className="px-4 py-3 text-xs text-swiss-muted">{ticket.place_number}</td>
                  <td className="px-4 py-3 text-xs text-swiss-muted">{ticket.entry_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
