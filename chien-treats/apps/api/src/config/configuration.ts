import { ConfigType, registerAs } from "@nestjs/config";
import { envSchema } from "./env.validation";

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.flatten((issue) => issue.message);
    throw new Error(
      `Invalid environment configuration: ${JSON.stringify(formatted.fieldErrors)}`,
    );
  }
  return result.data;
};

export const appConfig = registerAs("app", () => {
  const env = parseEnv();
  const stripeConfigured = Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PUBLIC_KEY);

  return {
    env: env.APP_ENV,
    isProduction: env.APP_ENV === "production",
    isTest: env.APP_ENV === "test",
    port: env.APP_PORT,
    baseUrl: env.APP_BASE_URL,
    frontendOrigin: env.FRONTEND_ORIGIN,
    databaseUrl: env.DATABASE_URL,
    redisUrl: env.REDIS_URL,
    jwt: {
      secret: env.JWT_SECRET,
      accessTokenTtl: env.JWT_EXPIRES_IN,
      refreshTokenTtl: env.REFRESH_EXPIRES_IN,
    },
    stripe: {
      enabled: stripeConfigured,
      publicKey: env.STRIPE_PUBLIC_KEY,
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    },
    uploads: {
      dir: env.UPLOAD_DIR,
      maxUploadBytes: env.MAX_UPLOAD_MB * 1024 * 1024,
    },
    rateLimit: {
      windowSec: env.RATE_LIMIT_WINDOW_SEC,
      max: env.RATE_LIMIT_MAX,
      authWindowSec: env.RATE_LIMIT_AUTH_WINDOW_SEC,
      authMax: env.RATE_LIMIT_AUTH_MAX,
    },
    metrics: {
      enabled: env.METRICS_ENABLED,
    },
    auth: {
      emailVerificationTtl: env.EMAIL_VERIFICATION_TTL,
    },
    email: {
      outputDir: env.EMAIL_OUTPUT_DIR,
    },
  } as const;
});

export type AppConfig = ConfigType<typeof appConfig>;
