"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui";
import { VerifiedUserGate } from "@/features/auth/VerifiedUserGate";
import { useTickets } from "@/features/ticketing/useTickets";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPage, setRequesterEmail } from "@/features/ticketing/ticketingSlice";
import { formatIsoDate } from "@/lib/utils";

export default function SupportPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const filters = useAppSelector((state) => state.ticketing);
  const { tickets, total, loading } = useTickets();

  const totalPages = Math.max(1, Math.ceil(total / 20));

  useEffect(() => {
    if (user) {
      dispatch(setRequesterEmail(user.email));
      dispatch(setPage(1));
    }
  }, [dispatch, user]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="font-brand text-4xl text-brown">My Support Tickets</h1>
          <p className="text-brown/70">View and track your support requests.</p>
        </div>
        <Button asChild>
          <Link href="/support/new">Create New Ticket</Link>
        </Button>
      </header>

      <VerifiedUserGate
        title="Sign in to view your tickets"
        description="You need an account to view and track your support tickets. Sign in or create an account to continue."
      >
        <Card>
          <CardHeader>
            <CardTitle>Your Tickets</CardTitle>
            <CardDescription>
              {total > 0 ? `You have ${total} ticket${total === 1 ? "" : "s"}` : "No tickets yet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <p className="text-brown/70">Loading your tickets...</p>
              </div>
            ) : tickets.length > 0 ? (
              <>
                {tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/support/tickets/${ticket.id}`}
                    className="block rounded-3xl border border-brown/10 bg-white p-4 shadow-soft transition hover:border-pink hover:shadow-elevated"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex-1">
                        <h2 className="font-brand text-lg text-brown">{ticket.title}</h2>
                        <p className="mt-1 text-sm text-brown/70 line-clamp-2">{ticket.body}</p>
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
                        <p className="text-xs text-brown/60">{formatIsoDate(ticket.createdAt)}</p>
                      </div>
                    </div>
                    {ticket.labels.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {ticket.labels.map((label) => (
                          <span
                            key={label}
                            className="rounded-full bg-pink/15 px-2 py-1 text-xs text-pink"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={filters.page <= 1}
                      onClick={() => dispatch(setPage(filters.page - 1))}
                    >
                      Previous
                    </Button>
                    <p className="text-sm text-brown/70">
                      Page {filters.page} of {totalPages}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={filters.page >= totalPages}
                      onClick={() => dispatch(setPage(filters.page + 1))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 text-center">
                <p className="text-brown/70">You haven&apos;t created any support tickets yet.</p>
                <Button asChild>
                  <Link href="/support/new">Create Your First Ticket</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </VerifiedUserGate>
    </div>
  );
}
