import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getParkings, createParking } from "../services/admin";

export default function Parkings() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [totalPlaces, setTotalPlaces] = useState(10);

  const { data: parkings, isLoading } = useQuery({
    queryKey: ["parkings"],
    queryFn: getParkings,
  });

  const mutation = useMutation({
    mutationFn: createParking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parkings"] });
      setShowForm(false);
      setName("");
      setAddress("");
      setTotalPlaces(10);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, address: address || undefined, total_places: totalPlaces });
  };

  return (
    <div>
      <div className="flex justify-between items-center border-b border-swiss-border pb-4 mb-6">
        <h1 className="text-sm font-bold tracking-widest uppercase text-swiss-text">Parkings</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-swiss-accent text-white text-xs tracking-widest uppercase px-4 py-2 hover:opacity-90"
        >
          {showForm ? "Annuler" : "+ Nouveau parking"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="border border-swiss-border p-6 mb-6 space-y-4"
        >
          <div>
            <label className="block text-xs text-swiss-muted mb-1">Nom *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 placeholder:text-swiss-muted focus:outline-none focus:border-swiss-accent"
            />
          </div>
          <div>
            <label className="block text-xs text-swiss-muted mb-1">Adresse</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 placeholder:text-swiss-muted focus:outline-none focus:border-swiss-accent"
            />
          </div>
          <div>
            <label className="block text-xs text-swiss-muted mb-1">Nombre de places *</label>
            <input
              type="number"
              required
              min={1}
              value={totalPlaces}
              onChange={(e) => setTotalPlaces(Number(e.target.value))}
              className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 focus:outline-none focus:border-swiss-accent"
            />
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-swiss-accent text-white text-xs tracking-widest uppercase px-6 py-2 hover:opacity-90 disabled:opacity-30"
          >
            {mutation.isPending ? "Creation..." : "Creer le parking"}
          </button>
        </form>
      )}

      {isLoading ? (
        <p className="text-xs text-swiss-muted">Chargement...</p>
      ) : (
        <div className="border border-swiss-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-swiss-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">#</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Nom</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Adresse</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Places</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-swiss-muted">Disponibles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-swiss-border">
              {parkings?.map((p) => (
                <tr key={p.id} className="hover:bg-swiss-neutral">
                  <td className="px-4 py-3 text-xs text-swiss-text">{p.id}</td>
                  <td className="px-4 py-3 text-xs font-medium text-swiss-text">{p.name}</td>
                  <td className="px-4 py-3 text-xs text-swiss-muted">{p.address ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-swiss-muted">{p.total_places}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-1 text-xs border ${
                      p.available_places > 0
                        ? "border-swiss-border text-swiss-text"
                        : "border-swiss-red text-swiss-red"
                    }`}>
                      {p.available_places}
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
