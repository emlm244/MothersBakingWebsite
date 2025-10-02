"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui";
import { useDataProvider } from "@/lib/data-provider";
import { useSession } from "@/features/session/useSession";

const ROLES = ["guest", "customer", "staff", "support", "admin"] as const;

export default function AdminDevToolsPage() {
  const provider = useDataProvider();
  const { session, impersonate } = useSession();
  const [message, setMessage] = useState<string | null>(null);

  async function seed() {
    if (!provider) return;
    await provider.seed();
    setMessage("Demo data re-seeded.");
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-brand text-3xl text-brown">Developer tools</h1>
        <p className="text-sm text-brown/70">Seed data, impersonate roles, and preview transactional email text.</p>
      </header>
      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      <Card>
        <CardHeader>
          <CardTitle>Seed demo data</CardTitle>
          <CardDescription>Clears IndexedDB and repopulates products, orders, reviews, and tickets.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={seed}>Re-seed data</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Role impersonation</CardTitle>
          <CardDescription>Current role: {session.role}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {ROLES.map((role) => (
            <Button
              key={role}
              variant={session.role === role ? "primary" : "outline"}
              onClick={() => impersonate(role)}
            >
              {role}
            </Button>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Email previews</CardTitle>
          <CardDescription>HTML templates ship in packages/emails (text preview shown below).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-brown/70">
          <section>
            <h2 className="font-semibold text-brown">Order confirmation</h2>
            <p>Subject: Your Chien&apos;s Treats order is demo-paid</p>
            <p>Body: Thank you for ordering a macaron assortment! We will reach out with pickup details.</p>
          </section>
          <section>
            <h2 className="font-semibold text-brown">Ticket created</h2>
            <p>Subject: We received your support ticket</p>
            <p>Body: Our bakers will respond soon. Reply to this email with more details anytime.</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

