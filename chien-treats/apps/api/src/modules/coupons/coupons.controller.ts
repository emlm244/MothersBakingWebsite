import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { CouponsService } from "./coupons.service";
import { CouponUpsertDto, CouponValidateDto } from "./dto/coupon.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { Public } from "../../common/decorators/public.decorator";

@Controller({ path: "coupons" })
export class CouponsController {
  constructor(private readonly coupons: CouponsService) {}

  @Roles("admin", "staff")
  @Get()
  async list() {
    const items = await this.coupons.list();
    return { items };
  }

  @Roles("admin", "staff")
  @Post()
  async create(@Body() dto: CouponUpsertDto) {
    const coupon = await this.coupons.upsert(dto);
    return { coupon };
  }

  @Roles("admin", "staff")
  @Put(":code")
  async update(@Param("code") code: string, @Body() dto: CouponUpsertDto) {
    const coupon = await this.coupons.upsert({ ...dto, code });
    return { coupon };
  }

  @Roles("admin", "staff")
  @Delete(":code")
  async delete(@Param("code") code: string) {
    await this.coupons.remove(code);
    return { success: true };
  }

  @Public()
  @Post("validate")
  async validate(@Body() dto: CouponValidateDto) {
    const result = await this.coupons.validate(dto.code);
    return result;
  }
}
