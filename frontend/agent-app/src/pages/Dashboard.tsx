import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../services/api";

interface ParkingInfo {
  id: number;
  name: string;
  address: string | null;
  total_places: number;
  available_places: number;
}

export default function Dashboard() {
  const { data: parkings, isLoading } = useQuery<ParkingInfo[]>({
    queryKey: ["parkings"],
    queryFn: async () => {
      const res = await api.get("/api/parkings");
      return res.data;
    },
  });

  const totalAvailable =
    parkings?.reduce((sum, p) => sum + p.available_places, 0) ?? 0;
  const totalPlaces =
    parkings?.reduce((sum, p) => sum + p.total_places, 0) ?? 0;

  return (
    <div>
      <div className="border-b border-swiss-border pb-4 mb-6">
        <h1 className="text-sm font-bold tracking-widest uppercase text-swiss-text">Dashboard Agent</h1>
      </div>

      {isLoading ? (
        <p className="text-xs text-swiss-muted">Chargement...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="border border-swiss-border p-5">
              <p className="text-xs text-swiss-muted mb-1">Places disponibles</p>
              <p className="text-lg font-bold text-swiss-text">{totalAvailable}</p>
            </div>
            <div className="border border-swiss-border p-5">
              <p className="text-xs text-swiss-muted mb-1">Places totales</p>
              <p className="text-lg font-bold text-swiss-text">{totalPlaces}</p>
            </div>
            <div className="border border-swiss-border p-5">
              <p className="text-xs text-swiss-muted mb-1">Parkings</p>
              <p className="text-lg font-bold text-swiss-text">{parkings?.length ?? 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parkings?.map((parking) => (
              <div key={parking.id} className="border border-swiss-border p-5">
                <h3 className="text-sm font-bold text-swiss-text">{parking.name}</h3>
                <p className="text-xs text-swiss-muted">
                  {parking.address ?? "—"}
                </p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-swiss-text">
                    {parking.available_places} / {parking.total_places} disponibles
                  </span>
                  <span
                    className={`px-2 py-1 text-xs border ${
                      parking.available_places > 0
                        ? "border-swiss-border text-swiss-text"
                        : "border-swiss-red text-swiss-red"
                    }`}
                  >
                    {parking.available_places > 0 ? "Libre" : "Plein"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-4">
            <Link
              to="/check-in"
              className="bg-swiss-accent text-white text-xs tracking-widest uppercase px-6 py-3 hover:opacity-90"
            >
              Nouveau Check-In
            </Link>
            <Link
              to="/check-out"
              className="border border-swiss-border text-swiss-text text-xs tracking-widest uppercase px-6 py-3 hover:bg-swiss-neutral"
            >
              Check-Out
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
