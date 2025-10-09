import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { Coupon as CouponResponse } from "@data";
import { CouponUpsertDto } from "./dto/coupon.dto";

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<CouponResponse[]> {
    const coupons = await this.prisma.coupon.findMany({ orderBy: { code: "asc" } });
    return coupons.map((coupon) => this.toResponse(coupon));
  }

  async upsert(dto: CouponUpsertDto): Promise<CouponResponse> {
    const payload = this.normalize(dto);
    const coupon = await this.prisma.coupon.upsert({
      where: { code: payload.code },
      create: payload,
      update: payload,
    });
    return this.toResponse(coupon);
  }

  async remove(code: string) {
    await this.prisma.coupon.delete({ where: { code: code.toUpperCase() } });
  }

  async validate(code: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.active) {
      return { valid: false } as const;
    }
    const response = this.toResponse(coupon);
    return {
      valid: true,
      pctOff: response.pctOff,
      amountOffCents: response.amountOffCents,
    } as const;
  }

  private normalize(dto: CouponUpsertDto) {
    return {
      code: dto.code.toUpperCase(),
      pctOff: dto.pctOff ?? null,
      amountOffCents: dto.amountOffCents ?? null,
      active: dto.active ?? true,
    };
  }

  private toResponse(coupon: { code: string; pctOff: number | null; amountOffCents: number | null; active: boolean; createdAt: Date; updatedAt: Date }): CouponResponse {
    return {
      code: coupon.code,
      pctOff: coupon.pctOff ?? undefined,
      amountOffCents: coupon.amountOffCents ?? undefined,
      active: coupon.active,
    };
  }
}
