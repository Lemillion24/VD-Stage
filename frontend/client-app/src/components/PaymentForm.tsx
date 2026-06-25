import { useState } from "react";
import { usePayment } from "../hooks/usePayment";

const PAYMENT_METHODS = [
  { value: "cash", label: "Especes" },
  { value: "card", label: "Carte bancaire" },
  { value: "mobile_money", label: "Mobile Money" },
];

interface PaymentFormProps {
  ticketId: string;
  onSuccess?: () => void;
}

export default function PaymentForm({ ticketId, onSuccess }: PaymentFormProps) {
  const [method, setMethod] = useState("cash");
  const mutation = usePayment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(
      { ticket_id: ticketId, payment_method: method },
      { onSuccess: () => onSuccess?.() },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-swiss-muted mb-2">Mode de paiement</label>
        <div className="grid grid-cols-1 gap-2">
          {PAYMENT_METHODS.map((pm) => (
            <button
              key={pm.value}
              type="button"
              onClick={() => setMethod(pm.value)}
              className={`text-left px-4 py-3 text-xs border ${
                method === pm.value
                  ? "border-swiss-accent bg-swiss-accent text-white"
                  : "border-swiss-border text-swiss-muted hover:border-swiss-text"
              }`}
            >
              {pm.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-swiss-accent text-white text-xs tracking-widest uppercase py-2 hover:opacity-90 disabled:opacity-30"
      >
        {mutation.isPending ? "Traitement..." : "Payer"}
      </button>

      {mutation.isError && (
        <div className="border border-swiss-red text-swiss-red px-4 py-3">
          <p className="text-xs">{mutation.error.message}</p>
        </div>
      )}

      {mutation.isSuccess && (
        <div className="border border-swiss-accent text-swiss-accent px-4 py-3">
          <p className="text-xs">Paiement accepte — Transaction: {mutation.data.transaction_id}</p>
        </div>
      )}
    </form>
  );
}
