"use client";

import { useEffect, useState } from "react";
import type { Review } from "@data";
import { useDataProvider } from "@/lib/data-provider";

export function useReviews(
  productId: string | null | undefined,
  status: Review["status"] | undefined = "approved",
) {
  const provider = useDataProvider();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(Boolean(productId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setReviews([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load(id: string) {
      setLoading(true);
      try {
        const data = await provider.listReviews(id, status);
        if (cancelled) return;
        setReviews(data);
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load(productId);

    return () => {
      cancelled = true;
    };
  }, [provider, productId, status]);

  return { reviews, loading, error };
}
