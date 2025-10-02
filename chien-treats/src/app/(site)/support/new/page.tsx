"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, TextArea } from "@ui";
import { useCreateTicket } from "@/features/ticketing/useCreateTicket";
import { useDataProvider } from "@/lib/data-provider";

const ticketSchema = z.object({
  email: z.string().email("Enter a valid email"),
  orderNumber: z.string().optional(),
  title: z.string().min(6, "Add a short summary"),
  body: z.string().min(20, "Describe the question or issue"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export default function SupportNewPage() {
  const provider = useDataProvider();
  const { submit, submitting, error, ticket } = useCreateTicket();
  const [submitted, setSubmitted] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      email: "",
      orderNumber: "",
      title: "",
      body: "",
      priority: "medium",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setLookupError(null);
    let orderId: string | undefined;
    const orderQuery = values.orderNumber?.trim();
    if (orderQuery) {
      const orders = await provider.listOrders();
      const match = orders.find((order) => order.number.toLowerCase() === orderQuery.toLowerCase());
      if (!match) {
        setLookupError("We could not find that order number but we will still create the ticket.");
      } else {
        orderId = match.id;
      }
    }

    const created = await submit({
      requesterEmail: values.email,
      title: values.title,
      body: values.body,
      priority: values.priority,
      status: "open",
      orderId,
      labels: orderId ? ["orders"] : [],
      assigneeId: undefined,
      watchers: [],
      internalNotes: [],
      attachments: [],
    });
    if (created) {
      setSubmitted(true);
      form.reset({ email: "", orderNumber: "", title: "", body: "", priority: "medium" });
    }
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-brand text-4xl text-brown">Need a hand?</h1>
        <p className="text-brown/70">Send a note and the support team will reply within one business day.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Support ticket</CardTitle>
          <CardDescription>Share as much detail as possible. Attachments coming soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email ? <p className="text-sm text-red">{form.formState.errors.email.message}</p> : null}
            </div>
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
              <p className="text-sm text-green-700">Ticket {ticket.number} received! We will reply shortly.</p>
            ) : null}
            {lookupError ? <p className="text-sm text-brown/60">{lookupError}</p> : null}
            {error ? <p className="text-sm text-red">{error}</p> : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
