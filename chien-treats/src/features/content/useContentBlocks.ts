"use client";

import { useEffect, useState } from "react";
import type { ContentBlock } from "@data";
import { useDataProvider } from "@/lib/data-provider";

export function useContentBlock(key: string) {
  const provider = useDataProvider();
  const [block, setBlock] = useState<ContentBlock | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!provider) return;

    async function load() {
      const blocks = await provider.listContentBlocks();
      if (cancelled) return;
      setBlock(blocks.find((b) => b.key === key) ?? null);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [provider, key]);

  return block;
}

export function useAllContentBlocks() {
  const provider = useDataProvider();
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!provider) return;

    async function load() {
      const list = await provider.listContentBlocks();
      if (!cancelled) {
        setBlocks(list);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [provider]);

  return blocks;
}
