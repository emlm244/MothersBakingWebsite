"use client";

import { useEffect, useState } from "react";
import type { Product } from "@data";
import { useDataProvider } from "@/lib/data-provider";

export function useProduct(idOrSlug: string | null | undefined) {
  const provider = useDataProvider();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(Boolean(idOrSlug));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idOrSlug) {
      setProduct(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load(slug: string) {
      setLoading(true);
      try {
        const data = await provider.getProduct(slug);
        if (cancelled) return;
        setProduct(data);
        setError(data ? null : "Product not found");
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load(idOrSlug);

    return () => {
      cancelled = true;
    };
  }, [provider, idOrSlug]);

  return { product, loading, error };
}
