"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormInput } from "@/lib/forms/contact";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Contact Coral Hosts",
  description: "Start a conversation about managed hosting, migrations, or performance programs.",
  path: "/contact",
});

const projectTypes = [
  { value: "marketing-site", label: "Marketing site or CMS" },
  { value: "application", label: "Web application or API" },
  { value: "compliance", label: "Security & compliance program" },
  { value: "migration", label: "Migration or replatform" },
  { value: "consulting", label: "Consulting & advisory" },
];

const budgets = [
  { value: "below-2k", label: "Under $2k / month" },
  { value: "2-5k", label: "$2k–$5k / month" },
  { value: "5-10k", label: "$5k–$10k / month" },
  { value: "10k-plus", label: "$10k+ / month" },
];

const timelines = [
  { value: "urgent", label: "Within 30 days" },
  { value: "quarter", label: "Next quarter" },
  { value: "later", label: "3+ months from now" },
];

export default function ContactPage() {
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message?: string }>({
    type: "idle",
  });
  const startedAt = useMemo(() => Date.now(), []);
  const utmRef = useRef<{ utmSource?: string; utmCampaign?: string }>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      utmRef.current = {
        utmSource: params.get("utm_source") ?? undefined,
        utmCampaign: params.get("utm_campaign") ?? undefined,
      };
    }
  }, []);

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      projectType: "marketing-site",
      budget: "5-10k",
      timeline: "quarter",
      message: "",
      consent: true,
      startedAt,
      website: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setStatus({ type: "loading" });
    try {
      const payload = { ...values, startedAt, ...utmRef.current };
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message = data?.error?.formErrors?.join(" ") ?? "We couldn't submit the form. Please try again.";
        setStatus({ type: "error", message });
        return;
      }

      setStatus({ type: "success", message: "Thanks! Expect a reply within one business day." });
      form.reset();
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: "Unexpected error. Email hello@coralhosts.com instead." });
    }
  });

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-4 py-16 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:px-6">
      <section className="space-y-6">
        <h1 className="font-display text-4xl text-navy-900">Tell us about your goals</h1>
        <p className="text-sm text-slate-600">
          Share a few details about your current stack, upcoming launches, and what success looks like. We respond within one business day to coordinate a discovery call or provide next steps.
        </p>
        <form className="space-y-6" onSubmit={onSubmit} noValidate>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Name
              <input
                type="text"
                {...form.register("name")}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-200"
              />
              {form.formState.errors.name ? <span className="text-xs text-red-600">{form.formState.errors.name.message}</span> : null}
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Business email
              <input
                type="email"
                {...form.register("email")}
                autoComplete="email"
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-200"
              />
              {form.formState.errors.email ? <span className="text-xs text-red-600">{form.formState.errors.email.message}</span> : null}
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Company or organization
              <input
                type="text"
                {...form.register("company")}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-200"
              />
              {form.formState.errors.company ? <span className="text-xs text-red-600">{form.formState.errors.company.message}</span> : null}
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Phone (optional)
              <input
                type="tel"
                {...form.register("phone")}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-200"
              />
              {form.formState.errors.phone ? <span className="text-xs text-red-600">{form.formState.errors.phone.message}</span> : null}
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Project type
              <select
                {...form.register("projectType")}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-200"
              >
                {projectTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {form.formState.errors.projectType ? <span className="text-xs text-red-600">{form.formState.errors.projectType.message}</span> : null}
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Budget
              <select
                {...form.register("budget")}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-200"
              >
                {budgets.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {form.formState.errors.budget ? <span className="text-xs text-red-600">{form.formState.errors.budget.message}</span> : null}
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Timeline
              <select
                {...form.register("timeline")}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-200"
              >
                {timelines.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {form.formState.errors.timeline ? <span className="text-xs text-red-600">{form.formState.errors.timeline.message}</span> : null}
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Tell us about your current stack, upcoming launches, and success criteria
            <textarea
              {...form.register("message")}
              rows={6}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-200"
            />
            {form.formState.errors.message ? <span className="text-xs text-red-600">{form.formState.errors.message.message}</span> : null}
          </label>

          <label className="flex items-start gap-2 text-xs text-slate-600">
            <input type="checkbox" {...form.register("consent")} className="mt-1" /> I agree to receive emails about Coral Hosts services. We never sell your data.
            {form.formState.errors.consent ? <span className="text-xs text-red-600">{form.formState.errors.consent.message}</span> : null}
          </label>

          <input type="text" tabIndex={-1} autoComplete="off" {...form.register("website")} className="hidden" aria-hidden />

          <button
            type="submit"
            disabled={status.type === "loading"}
            className="inline-flex items-center rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status.type === "loading" ? "Sending..." : "Send message"}
          </button>
          {status.type === "success" ? <p className="text-sm text-green-700">{status.message}</p> : null}
          {status.type === "error" ? <p className="text-sm text-red-600">{status.message}</p> : null}
        </form>
      </section>

      <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="font-display text-2xl text-navy-900">What happens next?</h2>
        <ol className="space-y-4 text-sm text-slate-600">
          <li>
            <span className="font-semibold text-primary-600">1.</span> We reply within one business day with a 30-minute call invite.
          </li>
          <li>
            <span className="font-semibold text-primary-600">2.</span> You meet your delivery lead and map desired outcomes, SLAs, and stakeholders.
          </li>
          <li>
            <span className="font-semibold text-primary-600">3.</span> Within 5 business days you receive a proposal, onboarding plan, and first runbook draft.
          </li>
        </ol>
        <div className="rounded-xl bg-surface-muted/70 p-4 text-xs text-slate-500 shadow-xs">
          Prefer email? Reach out at <a href="mailto:hello@coralhosts.com" className="font-medium text-primary-600 hover:underline">hello@coralhosts.com</a> or call <a href="tel:+16195550160" className="font-medium text-primary-600 hover:underline">+1-619-555-0160</a>.
        </div>
      </aside>
    </div>
  );
}
