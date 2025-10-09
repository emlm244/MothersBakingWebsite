import { Injectable, Logger, OnApplicationShutdown, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis, { Redis as RedisClient } from "ioredis";

interface CacheEntry {
  value: string;
  expiresAt?: number;
}

@Injectable()
export class RedisService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(RedisService.name);
  private client?: RedisClient;
  private readonly fallback = new Map<string, CacheEntry>();
  private ready = false;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>("app.redisUrl");
    if (url) {
      this.client = new Redis(url, {
        lazyConnect: true,
        maxRetriesPerRequest: 2,
      });
    } else {
      this.logger.warn("REDIS_URL not set; falling back to in-memory cache");
    }
  }

  async onModuleInit() {
    if (!this.client) {
      this.ready = true;
      return;
    }
    try {
      await this.client.connect();
      await this.client.ping();
      this.ready = true;
      this.logger.log("Connected to Redis");
    } catch (error) {
      this.logger.error("Failed to connect to Redis; using in-memory fallback", error as Error);
      this.ready = false;
      if (this.client.status !== "end") {
        await this.client.quit();
      }
      this.client = undefined;
    }
  }

  async onApplicationShutdown() {
    if (this.client) {
      await this.client.quit();
    }
  }

  isReady() {
    return this.ready;
  }

  async get(key: string): Promise<string | null> {
    if (this.client) {
      return this.client.get(key);
    }
    const entry = this.fallback.get(key);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.fallback.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (this.client) {
      if (ttlSeconds) {
        await this.client.set(key, value, "EX", ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
      return;
    }
    this.fallback.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  }

  async del(key: string) {
    if (this.client) {
      await this.client.del(key);
      return;
    }
    this.fallback.delete(key);
  }
}
