"use client";

import { useEffect, useState } from "react";
import type { Review } from "@data";
import { useDataProvider } from "@/lib/data-provider";

export function useAllReviews(status: Review["status"] = "approved") {
  const provider = useDataProvider();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const products = await provider.listProducts();
      const perProduct = await Promise.all(
        products.map((product) => provider.listReviews(product.id, status))
      );
      if (!cancelled) {
        setReviews(perProduct.flat());
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [provider, status]);

  return reviews;
}
