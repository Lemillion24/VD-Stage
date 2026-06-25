import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export default function Tarifs() {
  const { data: tarifs, isLoading } = useQuery({
    queryKey: ["tarifs"],
    queryFn: async () => {
      const res = await api.get("/api/tarifs");
      return res.data;
    },
  });

  return (
    <div>
      <div className="border-b border-swiss-border pb-4 mb-6">
        <h1 className="text-sm font-bold tracking-widest uppercase text-swiss-text">Configuration des Tarifs</h1>
      </div>

      {isLoading ? (
        <p className="text-xs text-swiss-muted">Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-swiss-border p-6">
            <h2 className="text-sm font-bold mb-4 text-swiss-text">Tarifs actuels</h2>
            <div className="space-y-4">
              <div className="flex justify-between pb-2 border-b border-swiss-border">
                <span className="text-xs text-swiss-muted">Tarif horaire</span>
                <span className="text-sm font-bold text-swiss-accent">{tarifs?.tarif_horaire?.toLocaleString()} FC</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-swiss-border">
                <span className="text-xs text-swiss-muted">Tarif journalier (max)</span>
                <span className="text-sm font-bold text-swiss-accent">{tarifs?.tarif_journalier?.toLocaleString()} FC</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-swiss-border">
                <span className="text-xs text-swiss-muted">Delai de grace</span>
                <span className="text-sm font-bold text-swiss-text">{tarifs?.delai_grace_minutes} min</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-swiss-border">
                <span className="text-xs text-swiss-muted">Taxe parking</span>
                <span className="text-sm font-bold text-swiss-text">{(tarifs?.taxe_parking * 100)?.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className="border border-swiss-border p-6">
            <h2 className="text-sm font-bold mb-4 text-swiss-text">Coefficients par type</h2>
            <div className="space-y-3">
              {[
                { type: "Moto", factor: "x0.5" },
                { type: "Compacte", factor: "x0.8" },
                { type: "Berline", factor: "x1.0" },
                { type: "SUV", factor: "x1.2" },
                { type: "Camion", factor: "x1.5" },
              ].map((item) => (
                <div key={item.type} className="flex justify-between pb-2 border-b border-swiss-border">
                  <span className="text-xs text-swiss-muted">{item.type}</span>
                  <span className="text-xs font-mono text-swiss-text">{item.factor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
