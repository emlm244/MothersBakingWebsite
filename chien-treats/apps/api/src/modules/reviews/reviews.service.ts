import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { Review as ReviewResponse } from "@data";
import { ReviewStatus } from "@prisma/client";
import { ReviewCreateDto, ReviewStatusDto } from "./dto/review.dto";
import { sanitizeMarkdown, sanitizePlain } from "../../common/utils/sanitize";
import { EventsService } from "../../events/events.service";

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventsService) {}

  async list(productId: string, status?: ReviewStatus | "all"): Promise<ReviewResponse[]> {
    const where = {
      productId,
      ...(status && status !== "all" ? { status } : {}),
    };

    const reviews = await this.prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return reviews.map((review) => this.toResponse(review));
  }

  async create(dto: ReviewCreateDto): Promise<ReviewResponse> {
    await this.ensureProduct(dto.productId);

    const review = await this.prisma.review.create({
      data: {
        productId: dto.productId,
        userName: sanitizePlain(dto.userName),
        rating: dto.rating,
        title: dto.title ? sanitizePlain(dto.title) : undefined,
        body: sanitizeMarkdown(dto.body),
        status: ReviewStatus.pending,
      },
    });

    return this.toResponse(review);
  }

  async updateStatus(id: string, dto: ReviewStatusDto): Promise<ReviewResponse> {
    const review = await this.prisma.review.update({
      where: { id },
      data: {
        status: dto.status,
        rejectionReason: dto.status === ReviewStatus.rejected ? dto.rejectionReason ?? "" : null,
      },
    });

    const response = this.toResponse(review);

    const eventType = dto.status === ReviewStatus.approved ? "review:approved" : dto.status === ReviewStatus.rejected ? "review:rejected" : "review:updated";
    this.events.emit("reviews", eventType, response);

    return response;
  }

  private async ensureProduct(productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException("Product not found");
    }
  }

  private toResponse(review: { id: string; productId: string; userName: string; rating: number; title: string | null; body: string; status: ReviewStatus; rejectionReason: string | null; createdAt: Date; updatedAt: Date }): ReviewResponse {
    return {
      id: review.id,
      productId: review.productId,
      userName: review.userName,
      rating: review.rating as 1 | 2 | 3 | 4 | 5,
      title: review.title ?? undefined,
      body: review.body,
      status: review.status,
      rejectionReason: review.rejectionReason ?? undefined,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }
}
