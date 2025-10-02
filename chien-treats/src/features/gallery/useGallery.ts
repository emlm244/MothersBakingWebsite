"use client";

import { useEffect, useState } from "react";
import type { GalleryItem } from "@data";
import { useDataProvider } from "@/lib/data-provider";

export function useGallery() {
  const provider = useDataProvider();
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!provider) return;

    async function load() {
      const list = await provider.listGalleryItems();
      if (!cancelled) {
        setItems(list);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [provider]);

  return items;
}
