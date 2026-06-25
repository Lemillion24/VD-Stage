import type { CheckInResponse } from "@shared/types/ticket";

interface TicketInfoProps {
  ticket: CheckInResponse & { amount?: number; duration_minutes?: number; exit_time?: string };
}

export default function TicketInfo({ ticket }: TicketInfoProps) {
  return (
    <div className="border border-swiss-border p-6 space-y-3">
      <h2 className="text-sm font-bold text-swiss-text">Details du Ticket</h2>
      <div className="border-t border-swiss-border pt-3 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-swiss-muted">Ticket</span>
          <span className="font-mono font-medium text-swiss-text">{ticket.ticket_id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-swiss-muted">Place</span>
          <span className="text-swiss-text">{ticket.place_number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-swiss-muted">Entree</span>
          <span className="text-swiss-text">{ticket.entry_time}</span>
        </div>
        {ticket.duration_minutes !== undefined && (
          <div className="flex justify-between">
            <span className="text-swiss-muted">Duree</span>
            <span className="text-swiss-text">{ticket.duration_minutes} minutes</span>
          </div>
        )}
        {ticket.amount !== undefined && (
          <div className="flex justify-between">
            <span className="text-swiss-muted">Montant</span>
            <span className="font-bold text-swiss-accent">{ticket.amount.toLocaleString()} FC</span>
          </div>
        )}
      </div>
    </div>
  );
}
