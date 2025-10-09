"use client";

import { useCallback, useState } from "react";
import type { Ticket, TicketCreateInput } from "@data";
import { useDataProvider } from "@/lib/data-provider";
import { useAnalytics } from "@/lib/analytics";

export function useCreateTicket() {
  const provider = useDataProvider();
  const { track } = useAnalytics();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [accessCode, setAccessCode] = useState<string | null>(null);

  const submit = useCallback(
    async (input: TicketCreateInput) => {
      if (!provider) return null;
      setSubmitting(true);
      setError(null);
      setTicket(null);
      setAccessCode(null);
      try {
        const result = await provider.createTicket(input);
        setTicket(result.ticket);
        setAccessCode(result.accessCode);
        track({ type: "create_ticket", payload: { ticketId: result.ticket.id } });
        return result.ticket;
      } catch (err) {
        setError((err as Error).message);
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [provider, track],
  );

  return { submit, submitting, error, ticket, accessCode };
}
