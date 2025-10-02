"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { DataProviderProvider } from "@/lib/data-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <DataProviderProvider>{children}</DataProviderProvider>
    </Provider>
  );
}
