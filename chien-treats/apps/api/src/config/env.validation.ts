import { z } from "zod";

export const envSchema = z.object({
  APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_PORT: z.coerce.number().int().positive().default(4000),
  APP_BASE_URL: z.string().url().default("http://localhost:4000"),
  FRONTEND_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("1h"),
  REFRESH_EXPIRES_IN: z.string().default("30d"),
  STRIPE_PUBLIC_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_WINDOW_SEC: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_AUTH_WINDOW_SEC: z.coerce.number().int().positive().default(900),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().int().positive().default(20),
  METRICS_ENABLED: z.coerce.boolean().default(true),
  EMAIL_OUTPUT_DIR: z.string().default("./tmp/emails"),
  EMAIL_VERIFICATION_TTL: z.string().default("24h"),
});

export type EnvSchema = z.infer<typeof envSchema>;
