import { Logger } from "nestjs-pino";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyMultipart from "@fastify/multipart";
import { ConfigService } from "@nestjs/config";
import { RequestMethod, VersioningType, ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const adapter = new FastifyAdapter({
    logger: false,
  });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);
  app.useLogger(logger);

  const appConfig = configService.get("app");
  const frontendOrigins = (appConfig?.frontendOrigin ?? "http://localhost:3000")
    .split(",")
    .map((origin: string) => origin.trim());

  await app.register(fastifyCookie, {
    secret: appConfig?.jwt.secret,
    hook: "onRequest",
  });

  await app.register(fastifyCors, {
    origin: frontendOrigins,
    credentials: true,
  });

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });

  await app.register(fastifyRateLimit, {
    max: appConfig?.rateLimit.max ?? 100,
    timeWindow: (appConfig?.rateLimit.windowSec ?? 300) * 1000,
    ban: 0,
    allowList: [],
  });

  const rawBody = await import("fastify-raw-body");
  await app.register((rawBody as any).default ?? rawBody, {
    field: "rawBody",
    global: true,
    encoding: "utf8",
    runFirst: true,
  });

  await app.register(fastifyMultipart, {
    limits: {
      fileSize: appConfig?.uploads.maxUploadBytes ?? 5 * 1024 * 1024,
    },
  });

  app.setGlobalPrefix("api/v1", {
    exclude: [
      { path: "healthz", method: RequestMethod.GET },
      { path: "readyz", method: RequestMethod.GET },
      { path: "metrics", method: RequestMethod.GET },
    ],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  if (!appConfig?.isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Chien's Treats API")
      .setDescription("REST API powering the Chien's Treats front-end.")
      .setVersion("1.0.0")
      .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" })
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/v1/docs", app, document, {
      jsonDocumentUrl: "api/v1/openapi.json",
    });
  }

  const port = appConfig?.port ?? 4000;
  await app.listen({
    port,
    host: "0.0.0.0",
  });

  logger.log(`API listening on http://localhost:${port}`);
}

void bootstrap();
