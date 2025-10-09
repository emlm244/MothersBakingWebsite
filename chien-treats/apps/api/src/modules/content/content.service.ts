import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { ContentBlock as ContentBlockResponse } from "@data";
import { ContentUpsertDto } from "./dto/content.dto";
import { sanitizeMarkdown, sanitizePlain } from "../../common/utils/sanitize";

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async get(key: string): Promise<ContentBlockResponse> {
    const block = await this.prisma.contentBlock.findUnique({ where: { key } });
    if (!block) {
      throw new NotFoundException("Content block not found");
    }
    return this.toResponse(block);
  }

  async upsert(key: string, dto: ContentUpsertDto): Promise<ContentBlockResponse> {
    const payload = {
      key,
      title: sanitizePlain(dto.title),
      bodyMd: sanitizeMarkdown(dto.bodyMd),
    };

    const block = await this.prisma.contentBlock.upsert({
      where: { key },
      create: payload,
      update: payload,
    });

    return this.toResponse(block);
  }

  private toResponse(block: { id: string; key: string; title: string; bodyMd: string; updatedAt: Date }) {
    return {
      id: block.id,
      key: block.key,
      title: block.title,
      bodyMd: block.bodyMd,
      updatedAt: block.updatedAt.toISOString(),
    } satisfies ContentBlockResponse;
  }
}
