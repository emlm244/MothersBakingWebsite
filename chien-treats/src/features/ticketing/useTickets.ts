"use client";

import { useEffect, useState } from "react";
import type { Ticket } from "@data";
import { useDataProvider } from "@/lib/data-provider";
import { useAppSelector } from "@/store/hooks";

export function useTickets() {
  const provider = useDataProvider();
  const filters = useAppSelector((state) => state.ticketing);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!provider) return;

    async function load() {
      setLoading(true);
      try {
        const { items, total } = await provider.listTickets({
          status: filters.status,
          search: filters.search,
          labels: filters.labels,
          requesterEmail: filters.requesterEmail,
          page: filters.page,
          pageSize: 20,
        });
        if (cancelled) return;
        setTickets(items);
        setTotal(total);
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
  }, [provider, filters.labels, filters.page, filters.search, filters.status, filters.requesterEmail]);

  return { tickets, total, loading, error };
}
