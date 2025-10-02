"use client";

import { useEffect, useState } from "react";
import type { Product } from "@data";
import { useDataProvider } from "@/lib/data-provider";

export function useProducts() {
  const provider = useDataProvider();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!provider) return;

    async function load() {
      setLoading(true);
      try {
        const data = await provider.listProducts();
        if (cancelled) return;
        setProducts(data);
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [provider]);

  return { products, loading, error };
}
