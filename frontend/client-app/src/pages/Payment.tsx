import { useParams, useNavigate } from "react-router-dom";
import PaymentForm from "../components/PaymentForm";

export default function PaymentPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();

  return (
    <div>
      <div className="border-b border-swiss-border pb-4 mb-6">
        <h1 className="text-sm font-bold tracking-widest uppercase text-swiss-text">Paiement</h1>
      </div>

      <div className="border border-swiss-border p-6">
        <p className="text-xs text-swiss-muted mb-4">
          Ticket: <span className="font-mono font-medium text-swiss-text">{ticketId}</span>
        </p>

        {ticketId && (
          <PaymentForm
            ticketId={ticketId}
            onSuccess={() => navigate("/")}
          />
        )}
      </div>
    </div>
  );
}
