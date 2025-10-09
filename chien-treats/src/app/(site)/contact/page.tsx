"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, TextArea } from "@ui";
import { Mail, Phone, MapPin } from "lucide-react";
import { useCreateTicket } from "@/features/ticketing/useCreateTicket";
import { useAppSelector } from "@/store/hooks";

const contactSchema = z.object({
  name: z.string().min(2, "Let us know who we're talking to"),
  topic: z.enum(["order", "event", "press", "other"]),
  message: z.string().min(20, "Tell us a little more so we can help quickly"),
  sweetField: z.literal("").optional(), // honeypot
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { submit, submitting, error, ticket, accessCode } = useCreateTicket();
  const [submitted, setSubmitted] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: user?.name ?? "",
      topic: "order",
      message: "",
      sweetField: "",
    },
  });

  useEffect(() => {
    if (user?.name) {
      form.setValue("name", user.name);
    }
  }, [user?.name, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (values.sweetField) {
      return;
    }

    const created = await submit({
      title: `[Contact] ${values.topic} inquiry from ${values.name}`,
      body: values.message,
      priority: "low",
      status: "open",
      orderId: undefined,
      labels: ["contact", values.topic],
      assigneeId: undefined,
      watchers: [],
      internalNotes: [],
      attachments: [],
    });

    if (created) {
      setSubmitted(true);
      form.reset({ name: user?.name ?? "", topic: "order", message: "", sweetField: "" });
    }
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Send us a note</CardTitle>
          <CardDescription>
            We reply to every message within one business day. For urgent order updates, call our studio line.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" autoComplete="name" {...form.register("name")} />
                {form.formState.errors.name ? (
                  <p className="text-sm text-red">{form.formState.errors.name.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <select
                  id="topic"
                  className="h-12 w-full rounded-2xl border border-brown/20 bg-white px-4 text-brown shadow-soft focus-visible:border-pink focus-visible:outline-none"
                  {...form.register("topic")}
                >
                  <option value="order">Order update</option>
                  <option value="event">Event or catering</option>
                  <option value="press">Press & partnerships</option>
                  <option value="other">Something else</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">How can we help?</Label>
                <TextArea id="message" rows={6} {...form.register("message")} />
                {form.formState.errors.message ? (
                  <p className="text-sm text-red">{form.formState.errors.message.message}</p>
                ) : null}
              </div>
              {/* Honeypot */}
              <div className="hidden">
                <Label htmlFor="sweetField">Leave this field blank</Label>
                <Input id="sweetField" tabIndex={-1} autoComplete="off" {...form.register("sweetField")} />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Sending love..." : "Send message"}
              </Button>
              {submitted && ticket ? (
                <div className="space-y-1 rounded-2xl bg-green-50 p-4 text-sm text-green-800">
                  <p>
                    Thanks, {(form.getValues("name")?.trim() || "friend")}! Ticket{" "}
                    <strong>{ticket.number}</strong> is in our inbox.
                  </p>
                  {accessCode ? (
                    <p className="text-xs text-green-900">
                      Save access code{" "}
                      <span className="font-semibold tracking-wide">{accessCode}</span> to follow along.
                    </p>
                  ) : null}
                </div>
              ) : null}
              {error ? <p className="text-sm text-red">{error}</p> : null}
            </form>
          </CardContent>
        </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Visit the studio</CardTitle>
            <CardDescription>Our macaron kitchen is nestled in Capitol Hill.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-brown/80">
            <div className="flex gap-3">
              <MapPin className="mt-1 h-5 w-5 text-pink" aria-hidden />
              <div>
                <p className="font-semibold text-brown">714 E Pine St</p>
                <p>Seattle, WA 98122</p>
                <a
                  className="text-pink hover:text-pink-600 focus-visible:text-pink-600"
                  href="https://maps.google.com/?q=714+E+Pine+St+Seattle+WA+98122"
                >
                  Directions →
                </a>
              </div>
            </div>
            <div className="flex gap-3">
              <Phone className="mt-1 h-5 w-5 text-pink" aria-hidden />
              <div>
                <p className="font-semibold text-brown">(206) 555-0184</p>
                <p>Call 10am–6pm PST for same-day help.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Mail className="mt-1 h-5 w-5 text-pink" aria-hidden />
              <div>
                <p className="font-semibold text-brown">hello@chiens.treats</p>
                <p>Media or wholesale partners, drop us a line anytime.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hours & pick-up</CardTitle>
            <CardDescription>Order ahead for pickup or swing by for limited same-day boxes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-brown/80">
            <p>
              <strong className="font-brand">Mon–Thu</strong>: 10am – 6pm
            </p>
            <p>
              <strong className="font-brand">Fri</strong>: 10am – 7pm
            </p>
            <p>
              <strong className="font-brand">Sat</strong>: 9am – 5pm
            </p>
            <p>
              <strong className="font-brand">Sun</strong>: Closed for recipe testing
            </p>
            <p className="pt-2 text-xs">
              Parking tip: street parking on E Pine is metered—load zone for pickup out front after 2pm.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
