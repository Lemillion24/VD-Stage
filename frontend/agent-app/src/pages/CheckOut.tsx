import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CheckOut() {
  const [ticketId, setTicketId] = useState("");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/check-out", { ticket_id: ticketId });
      return res.data;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="max-w-lg">
      <div className="border-b border-swiss-border pb-4 mb-6">
        <h1 className="text-sm font-bold tracking-widest uppercase text-swiss-text">Check-Out</h1>
      </div>

      {mutation.isSuccess ? (
        <div className="border border-swiss-border p-6 space-y-2">
          <p className="text-xs text-swiss-accent">{mutation.data.message}</p>
          <p className="text-xs text-swiss-muted">Duree: <span className="text-swiss-text">{mutation.data.duration_minutes} min</span></p>
          <p className="text-xs text-swiss-muted">
            Montant: <span className="font-bold text-swiss-accent">{mutation.data.amount.toLocaleString()} FC</span>
          </p>
          <p className="text-xs text-swiss-muted">Sortie: <span className="text-swiss-text">{mutation.data.exit_time}</span></p>
          <button
            onClick={() => navigate("/payment")}
            className="mt-4 w-full bg-swiss-accent text-white text-xs tracking-widest uppercase py-2 hover:opacity-90"
          >
            Proceder au paiement
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-swiss-muted mb-1">ID du ticket *</label>
            <input
              type="text"
              required
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="TKT-2024-001"
              className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 placeholder:text-swiss-muted focus:outline-none focus:border-swiss-accent"
            />
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-swiss-accent text-white text-xs tracking-widest uppercase py-2 hover:opacity-90 disabled:opacity-30"
          >
            {mutation.isPending ? "Calcul en cours..." : "Calculer le montant"}
          </button>
          {mutation.isError && (
            <p className="text-xs text-swiss-red border border-swiss-red px-3 py-2">
              Ticket introuvable
            </p>
          )}
        </form>
      )}
    </div>
  );
}
