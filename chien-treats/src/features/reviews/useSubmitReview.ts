"use client";

import { useCallback, useState } from "react";
import type { Review } from "@data";
import { createId, nowIso } from "@data";
import { useDataProvider } from "@/lib/data-provider";
import { useAnalytics } from "@/lib/analytics";

export function useSubmitReview(productId: string | null) {
  const provider = useDataProvider();
  const { track } = useAnalytics();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(
    async (
      input: Omit<Review, "id" | "productId" | "status" | "createdAt" | "updatedAt" | "rating"> & {
        rating: number;
      },
    ) => {
      if (!productId) {
        setError("Product missing");
        return;
      }

      setSubmitting(true);
      setError(null);
      setSuccess(false);

      try {
        const rating = Math.min(5, Math.max(1, Math.round(input.rating))) as Review["rating"];
        await provider.submitReview({
          id: createId("review"),
          productId,
          status: "pending",
          createdAt: nowIso(),
          updatedAt: nowIso(),
          ...input,
          rating,
        });
        track({ type: "submit_review", payload: { productId, rating } });
        setSuccess(true);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setSubmitting(false);
      }
    },
    [productId, provider, track],
  );

  return { submit, submitting, error, success };
}
