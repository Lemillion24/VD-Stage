import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [ticketId, setTicketId] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketId.trim()) {
      navigate(`/ticket/${ticketId.trim()}`);
    }
  };

  return (
    <div>
      <div className="max-w-lg border border-swiss-border p-8">
        <h1 className="text-sm font-bold tracking-widest uppercase mb-1 text-swiss-text">
          Bienvenue au Parking
        </h1>
        <p className="text-xs text-swiss-muted mb-6">
          Entrez votre ID de ticket pour voir les informations
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value.toUpperCase())}
            placeholder="TKT-2024-001"
            className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-4 py-3 placeholder:text-swiss-muted focus:outline-none focus:border-swiss-accent"
          />
          <button
            type="submit"
            className="w-full bg-swiss-accent text-white text-xs tracking-widest uppercase px-4 py-3 hover:opacity-90"
          >
            Voir mon ticket
          </button>
        </form>
      </div>
    </div>
  );
}
