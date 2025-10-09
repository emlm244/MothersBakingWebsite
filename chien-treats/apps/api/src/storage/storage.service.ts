import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { promises as fs } from "fs";
import { join, resolve } from "path";
import { randomUUID } from "crypto";

@Injectable()
export class StorageService {
  private readonly baseDir: string;

  constructor(private readonly config: ConfigService) {
    const configured = this.config.get<string>("app.uploads.dir") ?? "./uploads";
    this.baseDir = resolve(configured);
  }

  async init() {
    await fs.mkdir(this.baseDir, { recursive: true });
  }

  async save(buffer: Buffer, options: { contentType: string; filename?: string }) {
    const key = `${randomUUID()}`;
    const filePath = join(this.baseDir, key);
    try {
      await fs.writeFile(filePath, buffer);
      return {
        key,
        mime: options.contentType,
        name: options.filename ?? key,
      };
    } catch (error) {
      throw new InternalServerErrorException("Failed to store attachment");
    }
  }

  async remove(key: string) {
    const filePath = join(this.baseDir, key);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  async read(key: string) {
    const filePath = join(this.baseDir, key);
    return fs.readFile(filePath);
  }
}
