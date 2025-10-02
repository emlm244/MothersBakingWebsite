"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, TextArea } from "@ui";
import { useTickets } from "@/features/ticketing/useTickets";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearFilters, setPage, setSearch, setStatus, toggleLabel } from "@/features/ticketing/ticketingSlice";
import { useDataProvider } from "@/lib/data-provider";
import type { Ticket } from "@data";
import { formatIsoDate } from "@/lib/utils";

const LABEL_OPTIONS = ["orders", "custom", "product", "billing"] as const;

export default function AdminTicketsPage() {
  const provider = useDataProvider();
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.ticketing);
  const { tickets, total, loading } = useTickets();
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const totalPages = Math.max(1, Math.ceil(total / 20));

  useEffect(() => {
    dispatch(setPage(1));
  }, [dispatch]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    dispatch(setSearch(value || undefined));
  };

  const handleNoteChange = (ticketId: string) => (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setNoteDrafts((prev) => ({ ...prev, [ticketId]: value }));
  };

  async function updateStatus(ticket: Ticket, status: Ticket["status"]) {
    await provider.updateTicket({ ...ticket, status, updatedAt: new Date().toISOString() });
  }

  async function addNote(ticket: Ticket) {
    const note = noteDrafts[ticket.id];
    if (!note?.trim()) return;
    await provider.updateTicket({
      ...ticket,
      internalNotes: [...ticket.internalNotes, { by: "admin", at: new Date().toISOString(), note }],
      updatedAt: new Date().toISOString(),
    });
    setNoteDrafts((prev) => ({ ...prev, [ticket.id]: "" }));
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-brand text-3xl text-brown">Support tickets</h1>
        <p className="text-sm text-brown/70">Filter by status or label and add internal notes.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Use demo tickets to test assignment flows.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="search">Search</Label>
            <Input id="search" value={filters.search ?? ""} onChange={handleSearchChange} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select
              className="h-12 w-full rounded-2xl border border-brown/20 bg-white px-4 text-brown shadow-soft focus-visible:border-pink focus-visible:outline-none"
              value={filters.status ?? ""}
              onChange={(event) => dispatch(setStatus(event.target.value ? (event.target.value as Ticket["status"]) : undefined))}
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="waiting">Waiting</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2">
              {LABEL_OPTIONS.map((label) => (
                <Button
                  key={label}
                  variant={filters.labels.includes(label) ? "primary" : "outline"}
                  size="sm"
                  onClick={() => dispatch(toggleLabel(label))}
                  type="button"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <Button type="button" variant="ghost" onClick={() => dispatch(clearFilters())}>
            Clear filters
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
          <CardDescription>Total {total}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-brown/70">Loading tickets...</p>
          ) : tickets.length ? (
            tickets.map((ticket) => (
              <article key={ticket.id} className="rounded-3xl border border-brown/10 bg-white p-4 shadow-soft">
                <header className="flex flex-wrap justify-between gap-2">
                  <div>
                    <h2 className="font-brand text-lg text-brown">{ticket.title}</h2>
                    <p className="text-xs text-brown/60">{ticket.requesterEmail} - {ticket.priority}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-cream px-3 py-1 text-xs uppercase text-brown/70">{ticket.status}</span>
                    <p className="text-xs text-brown/60">{formatIsoDate(ticket.createdAt)}</p>
                  </div>
                </header>
                <p className="mt-3 text-sm text-brown/80">{ticket.body}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-brown/60">
                  {ticket.labels.map((label) => (
                    <span key={label} className="rounded-full bg-pink/15 px-2 py-1 text-pink">{label}</span>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
                  <TextArea
                    rows={2}
                    placeholder="Internal note"
                    value={noteDrafts[ticket.id] ?? ""}
                    onChange={handleNoteChange(ticket.id)}
                  />
                  <Button variant="outline" onClick={() => addNote(ticket)}>Add note</Button>
                  <Button variant="outline" onClick={() => updateStatus(ticket, "waiting")}>Set waiting</Button>
                  <Button onClick={() => updateStatus(ticket, "closed")}>Close ticket</Button>
                </div>
                {ticket.internalNotes.length ? (
                  <div className="mt-4 space-y-2 rounded-2xl bg-cream p-3 text-xs text-brown/70">
                    {ticket.internalNotes.map((note, index) => (
                      <p key={index}>
                        <strong className="text-brown">{note.by}</strong> - {formatIsoDate(note.at)}: {note.note}
                      </p>
                    ))}
                  </div>
                ) : null}
              </article>
            ))
          ) : (
            <p className="text-brown/70">No tickets found.</p>
          )}
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" disabled={filters.page <= 1} onClick={() => dispatch(setPage(filters.page - 1))}>
              Previous
            </Button>
            <p className="text-sm text-brown/70">
              Page {filters.page} of {totalPages}
            </p>
            <Button type="button" variant="outline" disabled={filters.page >= totalPages} onClick={() => dispatch(setPage(filters.page + 1))}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
