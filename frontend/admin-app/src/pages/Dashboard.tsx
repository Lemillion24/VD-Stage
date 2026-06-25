import { useQuery } from "@tanstack/react-query";
import { getParkings } from "../services/admin";
import api from "../services/api";

export default function Dashboard() {
  const { data: parkings } = useQuery({
    queryKey: ["parkings"],
    queryFn: getParkings,
  });

  const { data: tarifs } = useQuery({
    queryKey: ["tarifs"],
    queryFn: async () => {
      const res = await api.get("/api/tarifs");
      return res.data;
    },
  });

  const totalPlaces = parkings?.reduce((s, p) => s + p.total_places, 0) ?? 0;
  const totalAvailable =
    parkings?.reduce((s, p) => s + p.available_places, 0) ?? 0;

  return (
    <div>
      <div className="border-b border-swiss-border pb-4 mb-6">
        <h1 className="text-sm font-bold tracking-widest uppercase text-swiss-text">Dashboard Admin</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-swiss-border p-5">
          <p className="text-xs text-swiss-muted mb-1">Parkings</p>
          <p className="text-lg font-bold text-swiss-text">{parkings?.length ?? 0}</p>
        </div>
        <div className="border border-swiss-border p-5">
          <p className="text-xs text-swiss-muted mb-1">Places disponibles</p>
          <p className="text-lg font-bold text-swiss-text">{totalAvailable}</p>
        </div>
        <div className="border border-swiss-border p-5">
          <p className="text-xs text-swiss-muted mb-1">Places totales</p>
          <p className="text-lg font-bold text-swiss-text">{totalPlaces}</p>
        </div>
        <div className="border border-swiss-border p-5">
          <p className="text-xs text-swiss-muted mb-1">Tarif horaire</p>
          <p className="text-lg font-bold text-swiss-accent">{tarifs?.tarif_horaire ?? 0} FC</p>
        </div>
      </div>

      <div className="border border-swiss-border p-5">
        <h2 className="text-sm font-bold mb-4 text-swiss-text">Parkings</h2>
        <div className="space-y-3">
          {parkings?.map((p) => (
            <div key={p.id} className="flex justify-between items-center pb-2 border-b border-swiss-border">
              <div>
                <p className="text-sm font-medium text-swiss-text">{p.name}</p>
                <p className="text-xs text-swiss-muted">{p.address ?? "—"}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs border ${
                  p.available_places > 0
                    ? "border-swiss-border text-swiss-text"
                    : "border-swiss-red text-swiss-red"
                }`}
              >
                {p.available_places}/{p.total_places} dispo
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
