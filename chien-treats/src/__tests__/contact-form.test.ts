import { contactFormSchema, MIN_FORM_TIME_MS } from "@/lib/forms/contact";

const basePayload = {
  name: "Avery Lee",
  email: "avery@example.com",
  company: "Coral Studios",
  phone: "",
  projectType: "marketing-site" as const,
  budget: "5-10k" as const,
  timeline: "quarter" as const,
  message: "We are migrating to a headless stack and need managed hosting.",
  consent: true as const,
  startedAt: Date.now() - (MIN_FORM_TIME_MS + 1000),
  website: "",
};

describe("contactFormSchema", () => {
  it("accepts a valid payload", () => {
    const result = contactFormSchema.safeParse(basePayload);
    expect(result.success).toBe(true);
  });

  it("rejects fast submissions", () => {
    const result = contactFormSchema.safeParse({ ...basePayload, startedAt: Date.now() });
    expect(result.success).toBe(false);
  });

  it("rejects when consent is missing", () => {
    const result = contactFormSchema.safeParse({ ...basePayload, consent: false });
    expect(result.success).toBe(false);
  });
});
