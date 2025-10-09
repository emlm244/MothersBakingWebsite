import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { ReviewCreateDto, ReviewStatusDto } from "./dto/review.dto";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthUser } from "../../auth/auth.types";
import { Roles } from "../../common/decorators/roles.decorator";
import { ReviewStatus } from "@prisma/client";

@Controller()
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Public()
  @Get("products/:productId/reviews")
  async list(
    @Param("productId") productId: string,
    @Query("status") statusParam: string | undefined,
    @CurrentUser() user: AuthUser | undefined,
  ) {
    const allowed = new Set([ReviewStatus.pending, ReviewStatus.approved, ReviewStatus.rejected]);
    const requested = statusParam && allowed.has(statusParam as ReviewStatus) ? (statusParam as ReviewStatus) : undefined;

    const canViewAll = user && ["admin", "staff"].includes(user.role);
    const status = canViewAll ? requested ?? "all" : ReviewStatus.approved;

    const reviews = await this.reviews.list(productId, status);
    return { items: reviews };
  }

  @Public()
  @Post("reviews")
  async create(@Body() dto: ReviewCreateDto) {
    const review = await this.reviews.create(dto);
    return { review };
  }

  @Roles("admin", "staff")
  @Patch("reviews/:id/status")
  async updateStatus(@Param("id") id: string, @Body() dto: ReviewStatusDto) {
    const review = await this.reviews.updateStatus(id, dto);
    return { review };
  }
}
