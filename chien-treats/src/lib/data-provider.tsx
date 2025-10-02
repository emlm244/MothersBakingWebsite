"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import type { DataProvider } from "@data";
import { createIndexedDbProvider, createInMemoryProvider } from "@data";

const DataProviderContext = createContext<DataProvider | null>(null);

async function ensureSeeded(provider: DataProvider) {
  const products = await provider.listProducts();
  if (!products.length) {
    await provider.seed();
  }
}

export function DataProviderProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<DataProvider>(() => createInMemoryProvider());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function prepare(current: DataProvider) {
      try {
        await current.ready();
        await ensureSeeded(current);
        if (active) {
          setReady(true);
        }
      } catch (err) {
        console.error("[data-provider] failed to prepare provider", err);
        if (active) {
          setError("Unable to initialize data provider.");
        }
      }
    }

    prepare(provider);
    return () => {
      active = false;
    };
  }, [provider]);

  useEffect(() => {
    let active = true;

    async function upgrade() {
      try {
        console.info("[data-provider] attempting indexeddb provider");
        const indexed = createIndexedDbProvider();
        await indexed.ready();
        await ensureSeeded(indexed);
        if (!active) return;
        console.info("[data-provider] indexeddb ready");
        setProvider(indexed);
        setError(null);
      } catch (err) {
        console.warn("[data-provider] IndexedDB provider failed, continuing with in-memory", err);
        if (!active) return;
        setError("Using in-memory data because IndexedDB is unavailable.");
      }
    }

    upgrade();
    return () => {
      active = false;
    };
  }, []);

  if (!ready || !provider) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-brown/70">
        Loading bakery goodness...
      </div>
    );
  }

  return (
    <DataProviderContext.Provider value={provider}>
      {error ? (
        <div role="alert" className="mb-4 rounded-2xl border border-red/30 bg-red/10 p-4 text-sm text-red">
          {error}
        </div>
      ) : null}
      {children}
    </DataProviderContext.Provider>
  );
}

export function useDataProvider(): DataProvider {
  const provider = useContext(DataProviderContext);
  if (!provider) {
    throw new Error("DataProvider not available. Make sure DataProviderProvider wraps your component tree.");
  }
  return provider;
}
