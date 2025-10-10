import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import { Logger } from "nestjs-pino";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(
    config: ConfigService,
    private readonly logger: Logger,
  ) {
    const databaseUrl = config.get<string>("app.databaseUrl");
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not configured");
    }
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }

  async onModuleInit() {
    const connectTimeout = 10000; // 10 seconds
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database connection timeout")), connectTimeout)
    );

    try {
      await Promise.race([this.$connect(), timeoutPromise]);
      this.logger.log("Connected to database", PrismaService.name);
    } catch (error) {
      this.logger.error("Failed to connect to database", error as Error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Disconnected from database", PrismaService.name);
  }
}
