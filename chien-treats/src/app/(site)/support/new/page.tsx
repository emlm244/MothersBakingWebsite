"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, TextArea } from "@ui";
import { useCreateTicket } from "@/features/ticketing/useCreateTicket";
import { VerifiedUserGate } from "@/features/auth/VerifiedUserGate";
import { useAppSelector } from "@/store/hooks";

const ticketSchema = z.object({
  orderNumber: z.string().optional(),
  title: z.string().min(6, "Add a short summary"),
  body: z.string().min(20, "Describe the question or issue"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export default function SupportNewPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { submit, submitting, error, ticket, accessCode } = useCreateTicket();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      orderNumber: "",
      title: "",
      body: "",
      priority: "medium",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const orderRef = values.orderNumber?.trim();

    const created = await submit({
      title: values.title,
      body: values.body,
      priority: values.priority,
      status: "open",
      orderId: undefined,
      labels: orderRef ? ["orders", `order:${orderRef}`] : ["support"],
      assigneeId: undefined,
      watchers: [],
      internalNotes: [],
      attachments: [],
    });
    if (created) {
      setSubmitted(true);
      form.reset({ orderNumber: "", title: "", body: "", priority: "medium" });
      // Redirect to the ticket detail page after a brief delay
      setTimeout(() => {
        router.push(`/support/tickets/${created.id}`);
      }, 1500);
    }
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-brand text-4xl text-brown">Need a hand?</h1>
        <p className="text-brown/70">Send a note and the support team will reply within one business day.</p>
      </header>
      <VerifiedUserGate>
        <Card>
          <CardHeader>
            <CardTitle>Support ticket</CardTitle>
            <CardDescription>
              {user ? (
                <span>
                  Signed in as <span className="font-medium text-brown">{user.email}</span>. Share as much detail as possible so
                  we can help quickly.
                </span>
              ) : (
                "Share as much detail as possible."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">Order number (optional)</Label>
              <Input id="orderNumber" {...form.register("orderNumber")} placeholder="ORD-1234" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Subject</Label>
              <Input id="title" {...form.register("title")} />
              {form.formState.errors.title ? <p className="text-sm text-red">{form.formState.errors.title.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                className="h-12 w-full rounded-2xl border border-brown/20 bg-white px-4 text-brown shadow-soft focus-visible:border-pink focus-visible:outline-none"
                {...form.register("priority")}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">How can we help?</Label>
              <TextArea id="body" rows={6} {...form.register("body")} />
              {form.formState.errors.body ? <p className="text-sm text-red">{form.formState.errors.body.message}</p> : null}
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Submit ticket"}
            </Button>
            {submitted && ticket ? (
              <div className="space-y-1 rounded-2xl bg-green-50 p-4 text-sm text-green-800">
                <p>
                  Ticket <strong>{ticket.number}</strong> received! We will reply shortly.
                </p>
                {accessCode ? (
                  <p className="text-xs text-green-900">
                    Save your access code{" "}
                    <span className="font-semibold tracking-wide">{accessCode}</span> to view updates any time.
                  </p>
                ) : null}
              </div>
            ) : null}
            {error ? <p className="text-sm text-red">{error}</p> : null}
          </form>
          </CardContent>
        </Card>
      </VerifiedUserGate>
    </div>
  );
}
