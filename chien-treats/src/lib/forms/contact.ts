import { z } from "zod";

export const MIN_FORM_TIME_MS = 4000;

export const contactFormSchema = z
  .object({
    name: z.string().min(2, "Tell us who we're speaking with."),
    email: z.string().email("Use a valid business email address."),
    company: z.string().min(2, "Add your company or organization."),
    phone: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || undefined),
    projectType: z.enum(
      ["marketing-site", "application", "compliance", "migration", "consulting"],
      { message: "Select the engagement type that fits best." },
    ),
    budget: z.enum(["below-2k", "2-5k", "5-10k", "10k-plus"], {
      message: "Share the monthly investment range so we can recommend a fit.",
    }),
    timeline: z.enum(["urgent", "quarter", "later"], {
      message: "Pick a timeline so we can staff the right pod.",
    }),
    message: z.string().min(40, "Share context about goals, constraints, or current stack."),
    consent: z.literal(true, {
      errorMap: () => ({ message: "Please confirm we can email you about Coral Hosts services." }),
    }),
    website: z.string().max(0).optional(), // honeypot
    startedAt: z.coerce.number(),
    utmSource: z.string().optional(),
    utmCampaign: z.string().optional(),
  })
  .refine(
    (values) => {
      const started = Number(values.startedAt);
      if (!Number.isFinite(started)) {
        return false;
      }
      return Date.now() - started >= MIN_FORM_TIME_MS;
    },
    {
      message: "That was quick—please review your details and try again.",
      path: ["startedAt"],
    },
  );

export type ContactFormInput = z.infer<typeof contactFormSchema>;
