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
    await this.$connect();
    this.logger.log("Connected to database", PrismaService.name);
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Disconnected from database", PrismaService.name);
  }
}
