import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../services/api";

interface Parking {
  id: number;
  name: string;
}

export default function CheckIn() {
  const [plateNumber, setPlateNumber] = useState("");
  const [parkingId, setParkingId] = useState("");
  const [vehicleType, setVehicleType] = useState("sedan");
  const [ownerName, setOwnerName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [reservationTime, setReservationTime] = useState("");

  const { data: parkings } = useQuery<Parking[]>({
    queryKey: ["parkings"],
    queryFn: async () => {
      const res = await api.get("/api/parkings");
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: {
      plate_number: string; parking_id: number; vehicle_type: string;
      owner_name: string; telephone?: string; email?: string;
      reservation_time?: number;
    }) => {
      const res = await api.post("/api/check-in", data);
      return res.data;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      plate_number: plateNumber,
      parking_id: Number(parkingId),
      vehicle_type: vehicleType,
      owner_name: ownerName,
      telephone: telephone || undefined,
      email: email || undefined,
      reservation_time: reservationTime ? Number(reservationTime) : undefined,
    });
  };

  const handleReset = () => {
    setPlateNumber("");
    setParkingId("");
    setVehicleType("sedan");
    setOwnerName("");
    setTelephone("");
    setEmail("");
    setReservationTime("");
    mutation.reset();
  };

  return (
    <div className="max-w-lg">
      <div className="border-b border-swiss-border pb-4 mb-6">
        <h1 className="text-sm font-bold tracking-widest uppercase text-swiss-text">Check-In</h1>
      </div>

      {mutation.isSuccess ? (
        <div className="border border-swiss-border p-6 space-y-2">
          <p className="text-xs text-swiss-accent">{mutation.data.message}</p>
          <p className="text-xs text-swiss-muted">Ticket: <span className="font-mono text-swiss-text">{mutation.data.ticket_id}</span></p>
          <p className="text-xs text-swiss-muted">Place: <span className="text-swiss-text">{mutation.data.place_number}</span></p>
          <p className="text-xs text-swiss-muted">Entree: <span className="text-swiss-text">{mutation.data.entry_time}</span></p>
          {mutation.data.owner_name && <p className="text-xs text-swiss-muted">Proprietaire: <span className="text-swiss-text">{mutation.data.owner_name}</span></p>}
          {mutation.data.telephone && <p className="text-xs text-swiss-muted">Tel: <span className="text-swiss-text">{mutation.data.telephone}</span></p>}
          {mutation.data.reservation_time && <p className="text-xs text-swiss-muted">Reservation: <span className="text-swiss-text">{mutation.data.reservation_time} min</span></p>}
          <button onClick={handleReset} className="mt-4 border border-swiss-border text-swiss-text text-xs tracking-widest uppercase w-full py-2 hover:bg-swiss-neutral">
            Nouveau check-in
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-swiss-muted mb-1">Numero de plaque *</label>
            <input
              type="text"
              required
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 placeholder:text-swiss-muted focus:outline-none focus:border-swiss-accent"
            />
          </div>
          <div>
            <label className="block text-xs text-swiss-muted mb-1">Parking *</label>
            <select
              required
              value={parkingId}
              onChange={(e) => setParkingId(e.target.value)}
              className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 focus:outline-none focus:border-swiss-accent"
            >
              <option value="">Selectionner un parking</option>
              {parkings?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-swiss-muted mb-1">Type de vehicule</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 focus:outline-none focus:border-swiss-accent"
            >
              <option value="sedan">Berline</option>
              <option value="compact">Compacte</option>
              <option value="suv">SUV</option>
              <option value="motorbike">Moto</option>
              <option value="truck">Camion</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-swiss-muted mb-1">Nom du proprietaire *</label>
            <input
              type="text"
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Nom complet"
              className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 placeholder:text-swiss-muted focus:outline-none focus:border-swiss-accent"
            />
          </div>
          <div>
            <label className="block text-xs text-swiss-muted mb-1">Telephone</label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+243 XXX XXX XXX"
              className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 placeholder:text-swiss-muted focus:outline-none focus:border-swiss-accent"
            />
          </div>
          <div>
            <label className="block text-xs text-swiss-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@exemple.com"
              className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 placeholder:text-swiss-muted focus:outline-none focus:border-swiss-accent"
            />
          </div>
          <div>
            <label className="block text-xs text-swiss-muted mb-1">Temps de reservation (minutes)</label>
            <input
              type="number"
              min="1"
              value={reservationTime}
              onChange={(e) => setReservationTime(e.target.value)}
              placeholder="Pour stationnement multi-jours"
              className="w-full bg-white text-swiss-text text-xs border border-swiss-border px-3 py-2 placeholder:text-swiss-muted focus:outline-none focus:border-swiss-accent"
            />
            <p className="text-[10px] text-swiss-muted mt-1">Si le client revient avant, la duree minimale facturee sera celle-ci.</p>
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-swiss-accent text-white text-xs tracking-widest uppercase py-2 hover:opacity-90 disabled:opacity-30"
          >
            {mutation.isPending ? "Entree en cours..." : "Enregistrer l'entree"}
          </button>
          {mutation.isError && (
            <p className="text-xs text-swiss-red border border-swiss-red px-3 py-2">
              Erreur lors de l'enregistrement
            </p>
          )}
        </form>
      )}
    </div>
  );
}
