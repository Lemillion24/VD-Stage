import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { CheckInResponse } from "@shared/types/ticket";
import { getTicket } from "../services/ticket";
import TicketInfoComponent from "../components/TicketInfo";

export default function TicketInfoPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { data: ticket, isLoading, isError } = useQuery<CheckInResponse>({
    queryKey: ["ticket", ticketId],
    queryFn: () => getTicket(ticketId!),
    enabled: !!ticketId,
  });

  return (
    <div>
      <div className="border-b border-swiss-border pb-4 mb-6">
        <h1 className="text-sm font-bold tracking-widest uppercase text-swiss-text">Mon Ticket</h1>
      </div>
      {isLoading && <p className="text-xs text-swiss-muted">Chargement...</p>}
      {isError && (
        <div className="border border-swiss-red p-8">
          <p className="text-xs text-swiss-red">Ticket introuvable. Verifiez l'ID saisi.</p>
        </div>
      )}
      {ticket && (
        <div className="space-y-4">
          <TicketInfoComponent ticket={ticket} />
        </div>
      )}
    </div>
  );
}
