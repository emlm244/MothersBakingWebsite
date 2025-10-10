"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Ticket } from "@data";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui";
import { VerifiedUserGate } from "@/features/auth/VerifiedUserGate";
import { useDataProvider } from "@/lib/data-provider";
import { useAppSelector } from "@/store/hooks";
import { formatIsoDate } from "@/lib/utils";

export default function TicketDetailPage() {
  const params = useParams();
  const provider = useDataProvider();
  const user = useAppSelector((state) => state.auth.user);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ticketId = params.id as string;

  useEffect(() => {
    let cancelled = false;

    async function loadTicket() {
      if (!provider || !ticketId) return;

      setLoading(true);
      setError(null);

      try {
        const fetchedTicket = await provider.getTicket(ticketId);
        if (cancelled) return;

        if (!fetchedTicket) {
          setError("Ticket not found");
          return;
        }

        // Verify the ticket belongs to the current user
        if (user && fetchedTicket.requesterEmail !== user.email) {
          setError("You don't have permission to view this ticket");
          return;
        }

        setTicket(fetchedTicket);
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message || "Failed to load ticket");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTicket();

    return () => {
      cancelled = true;
    };
  }, [provider, ticketId, user]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="font-brand text-4xl text-brown">Ticket Details</h1>
          <Button asChild variant="ghost" size="sm">
            <Link href="/support">← Back to My Tickets</Link>
          </Button>
        </div>
      </header>

      <VerifiedUserGate
        title="Sign in to view this ticket"
        description="You need to be signed in to view ticket details."
      >
        {loading ? (
          <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center">
              <p className="text-brown/70">Loading ticket...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-4">
              <p className="text-red">{error}</p>
              <Button asChild>
                <Link href="/support">View All Tickets</Link>
              </Button>
            </CardContent>
          </Card>
        ) : ticket ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle>{ticket.title}</CardTitle>
                    <CardDescription className="mt-2">
                      Created {formatIsoDate(ticket.createdAt)}
                      {ticket.updatedAt !== ticket.createdAt && (
                        <> · Updated {formatIsoDate(ticket.updatedAt)}</>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${
                        ticket.status === "open"
                          ? "bg-blue-50 text-blue-700"
                          : ticket.status === "in_progress"
                          ? "bg-yellow-50 text-yellow-700"
                          : ticket.status === "waiting"
                          ? "bg-orange-50 text-orange-700"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${
                        ticket.priority === "urgent"
                          ? "bg-red-50 text-red-700"
                          : ticket.priority === "high"
                          ? "bg-orange-50 text-orange-700"
                          : ticket.priority === "medium"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      {ticket.priority} priority
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-brown/70">Description</h3>
                  <p className="whitespace-pre-wrap text-brown">{ticket.body}</p>
                </div>

                {ticket.labels.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-brown/70">Labels</h3>
                    <div className="flex flex-wrap gap-2">
                      {ticket.labels.map((label) => (
                        <span
                          key={label}
                          className="rounded-full bg-pink/15 px-3 py-1 text-xs text-pink"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 rounded-2xl bg-cream p-4 text-sm md:grid-cols-2">
                  <div>
                    <span className="text-brown/70">Ticket Number:</span>
                    <span className="ml-2 font-medium text-brown">{ticket.number}</span>
                  </div>
                  <div>
                    <span className="text-brown/70">Requester:</span>
                    <span className="ml-2 font-medium text-brown">{ticket.requesterEmail}</span>
                  </div>
                  {ticket.orderId && (
                    <div>
                      <span className="text-brown/70">Related Order:</span>
                      <span className="ml-2 font-medium text-brown">{ticket.orderId}</span>
                    </div>
                  )}
                  {ticket.assigneeId && (
                    <div>
                      <span className="text-brown/70">Assigned To:</span>
                      <span className="ml-2 font-medium text-brown">{ticket.assigneeId}</span>
                    </div>
                  )}
                </div>

                {ticket.status === "closed" ? (
                  <div className="rounded-2xl bg-green-50 p-4 text-sm text-green-800">
                    <strong>This ticket has been closed.</strong> If you need further assistance,
                    please create a new ticket.
                  </div>
                ) : ticket.status === "waiting" ? (
                  <div className="rounded-2xl bg-orange-50 p-4 text-sm text-orange-800">
                    <strong>Waiting for response.</strong> Our support team will get back to you
                    shortly.
                  </div>
                ) : ticket.status === "in_progress" ? (
                  <div className="rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
                    <strong>In progress.</strong> Our team is actively working on your request.
                  </div>
                ) : (
                  <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
                    <strong>Your ticket is open.</strong> We typically respond within one business
                    day.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </VerifiedUserGate>
    </div>
  );
}
