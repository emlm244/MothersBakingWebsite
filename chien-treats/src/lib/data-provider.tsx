"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import type { DataProvider } from "@data";
import { createInMemoryProvider } from "@data/memory-provider";

const DataProviderContext = createContext<DataProvider | null>(null);

// Use in-memory provider for development (no backend required)
const dataProvider = createInMemoryProvider();

export function DataProviderProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    async function prepare() {
      try {
        await dataProvider.ready();
        if (active) {
          setReady(true);
        }
      } catch (err) {
        console.error("[data-provider] failed to initialize provider", err);
        if (active) {
          setReady(true);
        }
      }
    }
    prepare();
    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-brown/70">
        Loading bakery goodness...
      </div>
    );
  }

  return (
    <DataProviderContext.Provider value={dataProvider}>
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
