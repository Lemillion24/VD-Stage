import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export default function Reports() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: tickets } = useQuery({
    queryKey: ["reports-tickets", dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      const res = await api.get(`/api/tickets?${params}`);
      return res.data;
    },
  });

  const totalRevenue = tickets?.reduce((s: number, t: any) => s + t.amount, 0) ?? 0;
  const paidTickets = tickets?.filter((t: any) => t.status === "paid").length ?? 0;
  const activeTickets = tickets?.filter((t: any) => t.status === "active").length ?? 0;

  const exportCSV = () => {
    if (!tickets?.length) return;
    const headers = ["Ticket ID,Plaque,Type,Parking,Place,Entree,Sortie,Duree (min),Montant (FC),Statut,Paiement"];
    const rows = tickets.map((t: any) =>
      [t.ticket_id, t.plate_number, "", t.parking_name, t.place_number, t.entry_time, "", "", t.amount, t.status, ""].join(",")
    );
    const blob = new Blob([[...headers, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-${dateFrom || "debut"}-${dateTo || "fin"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="border-b border-swiss-border pb-4 mb-6">
        <h1 className="text-sm font-bold tracking-widest uppercase text-swiss-text">Rapports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border border-swiss-border p-5">
          <p className="text-xs text-swiss-muted mb-1">Revenu total</p>
          <p className="text-lg font-bold text-swiss-accent">{totalRevenue.toLocaleString()} FC</p>
        </div>
        <div className="border border-swiss-border p-5">
          <p className="text-xs text-swiss-muted mb-1">Tickets payes</p>
          <p className="text-lg font-bold text-swiss-text">{paidTickets}</p>
        </div>
        <div className="border border-swiss-border p-5">
          <p className="text-xs text-swiss-muted mb-1">Tickets actifs</p>
          <p className="text-lg font-bold text-swiss-text">{activeTickets}</p>
        </div>
      </div>

      <div className="border border-swiss-border p-6 mb-6">
        <h2 className="text-sm font-bold mb-4 text-swiss-text">Export</h2>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-xs text-swiss-muted mb-1">Du</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 focus:outline-none focus:border-swiss-accent" />
          </div>
          <div>
            <label className="block text-xs text-swiss-muted mb-1">Au</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 focus:outline-none focus:border-swiss-accent" />
          </div>
          <button onClick={exportCSV}
            className="bg-swiss-accent text-white text-xs tracking-widest uppercase px-4 py-2 hover:opacity-90">
            Exporter CSV
          </button>
        </div>
        <p className="text-xs text-swiss-muted mt-4">{tickets?.length ?? 0} ticket(s) enregistre(s)</p>
      </div>
    </div>
  );
}
