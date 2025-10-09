import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async liveness() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    } as const;
  }

  async readiness() {
    const db = await this.checkDatabase();
    const redis = await this.checkRedis();

    const allHealthy = db.healthy && redis.healthy;

    return {
      status: allHealthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      services: {
        database: db,
        redis,
      },
    } as const;
  }

  private async checkDatabase() {
    try {
      await this.prisma.$queryRaw(Prisma.sql`SELECT 1`);
      return { healthy: true } as const;
    } catch (error) {
      return { healthy: false, error: (error as Error).message } as const;
    }
  }

  private async checkRedis() {
    if (!this.redis.isReady()) {
      return { healthy: false, error: "Redis unavailable or in-memory fallback" } as const;
    }
    try {
      await this.redis.set("health:ping", "pong", 1);
      const pong = await this.redis.get("health:ping");
      return { healthy: pong === "pong" } as const;
    } catch (error) {
      return { healthy: false, error: (error as Error).message } as const;
    }
  }
}
