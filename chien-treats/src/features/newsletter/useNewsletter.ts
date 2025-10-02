"use client";

import { useState } from "react";
import { useDataProvider } from "@/lib/data-provider";
import { createId, nowIso } from "@data";

export function useNewsletterSignup() {
  const provider = useDataProvider();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (email: string) => {
    if (!provider) return;
    setStatus("loading");
    setMessage(null);
    try {
      await provider.addNewsletterSignup({ id: createId("news"), email, createdAt: nowIso() });
      setStatus("success");
      setMessage("Thanks for joining! We'll send seasonal updates.");
    } catch (err) {
      setStatus("error");
      setMessage((err as Error).message);
    }
  };

  return { submit, status, message };
}
