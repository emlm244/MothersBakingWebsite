"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, TextArea } from "@ui";
import { useDataProvider } from "@/lib/data-provider";
import type { Review } from "@data";
import { formatIsoDate } from "@/lib/utils";

interface ModerationRow extends Review {
  productName: string;
}

export default function AdminReviewsPage() {
  const provider = useDataProvider();
  const [pending, setPending] = useState<ModerationRow[]>([]);
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});

  const loadPending = useCallback(async () => {
    if (!provider) return;
    const products = await provider.listProducts();
    const entries = await Promise.all(
      products.map(async (product) => {
        const reviews = await provider.listReviews(product.id, "pending");
        return reviews.map((review) => ({ ...review, productName: product.name }));
      })
    );
    setPending(entries.flat());
  }, [provider]);

  useEffect(() => {
    void loadPending();
  }, [loadPending]);

  async function approve(review: Review) {
    if (!provider) return;
    await provider.setReviewStatus(review.id, "approved");
    loadPending();
  }

  async function reject(review: Review) {
    if (!provider) return;
    await provider.setReviewStatus(review.id, "rejected", rejectionReason[review.id] ?? "Not provided");
    loadPending();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-brand text-3xl text-brown">Review moderation</h1>
        <p className="text-sm text-brown/70">Approve guest feedback before it appears on the site.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Pending reviews</CardTitle>
          <CardDescription>Approve kind notes and reject anything off brand.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pending.length ? (
            pending.map((review) => (
              <article key={review.id} className="rounded-3xl border border-brown/10 bg-white p-4 shadow-soft">
                <header className="flex flex-wrap justify-between gap-2">
                  <div>
                    <h2 className="font-brand text-lg text-brown">{review.userName}</h2>
                    <p className="text-xs text-brown/60">{review.productName} - {"*".repeat(review.rating)}</p>
                  </div>
                  <p className="text-xs text-brown/60">{formatIsoDate(review.createdAt)}</p>
                </header>
                <p className="mt-3 text-sm text-brown/80">{review.body}</p>
                <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <TextArea
                    rows={2}
                    placeholder="Rejection reason"
                    value={rejectionReason[review.id] ?? ""}
                    onChange={(event) => setRejectionReason((prev) => ({ ...prev, [review.id]: event.target.value }))}
                  />
                  <Button variant="outline" onClick={() => reject(review)}>Reject</Button>
                  <Button onClick={() => approve(review)}>Approve</Button>
                </div>
              </article>
            ))
          ) : (
            <p className="text-brown/70">No reviews waiting. Encourage guests to leave feedback.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
