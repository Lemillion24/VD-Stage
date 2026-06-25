import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "../services/api";

const METHODS = [
  { id: "cash", label: "Especes" },
  { id: "card", label: "Carte bancaire" },
  { id: "mobile", label: "Mobile Money" },
  { id: "qr", label: "QR Code" },
];

export default function Payment() {
  const [ticketId, setTicketId] = useState("");
  const [method, setMethod] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/payment", { ticket_id: ticketId, payment_method: method });
      return res.data;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!method) return;
    mutation.mutate();
  };

  const handleReset = () => {
    setTicketId("");
    setMethod("");
    mutation.reset();
  };

  return (
    <div className="max-w-lg">
      <div className="border-b border-swiss-border pb-4 mb-6">
        <h1 className="text-sm font-bold tracking-widest uppercase text-swiss-text">Paiement</h1>
      </div>

      {mutation.isSuccess ? (
        <div className="border border-swiss-border p-6 space-y-2">
          <p className="text-xs text-swiss-accent">{mutation.data.message}</p>
          <p className="text-xs text-swiss-muted">
            Montant: <span className="font-bold text-swiss-accent">{mutation.data.amount.toLocaleString()} FC</span>
          </p>
          <p className="text-xs text-swiss-muted">Transaction: <span className="font-mono text-swiss-text">{mutation.data.transaction_id}</span></p>
          <button onClick={handleReset} className="mt-4 w-full border border-swiss-border text-swiss-text text-xs tracking-widest uppercase py-2 hover:bg-swiss-neutral">
            Nouveau paiement
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
          <div>
            <label className="block text-xs text-swiss-muted mb-1">Mode de paiement *</label>
            <div className="grid grid-cols-2 gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`text-left px-3 py-2 text-xs border ${
                    method === m.id
                      ? "border-swiss-accent bg-swiss-accent text-white"
                      : "border-swiss-border text-swiss-muted hover:border-swiss-text"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={mutation.isPending || !method}
            className="w-full bg-swiss-accent text-white text-xs tracking-widest uppercase py-2 hover:opacity-90 disabled:opacity-30"
          >
            {mutation.isPending ? "Traitement..." : "Payer"}
          </button>
          {mutation.isError && (
            <p className="text-xs text-swiss-red border border-swiss-red px-3 py-2">
              Erreur de paiement
            </p>
          )}
        </form>
      )}
    </div>
  );
}
