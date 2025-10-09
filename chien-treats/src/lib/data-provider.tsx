"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import type { DataProvider } from "@data";
import { createRestProvider } from "@data/rest-provider";

const DataProviderContext = createContext<DataProvider | null>(null);

// Use REST provider for production (connects to NestJS API)
// API base URL is set via NEXT_PUBLIC_API_BASE_URL environment variable
// In production with Nginx reverse proxy, this will be same-origin: /api/v1
const apiBaseUrl = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1")
  : (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1");

const dataProvider = createRestProvider(apiBaseUrl);

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
