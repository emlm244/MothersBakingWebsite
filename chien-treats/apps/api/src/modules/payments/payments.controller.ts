import { Body, Controller, Headers, Post, Req } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { ProblemException, problemTypes } from "../../common/errors/problem-details";
import { Public } from "../../common/decorators/public.decorator";

class CreateCheckoutDto {
  orderId!: string;
}

@Controller({ path: "payments" })
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post("stripe/create-checkout-session")
  async createCheckout(@Body() body: CreateCheckoutDto) {
    if (!body.orderId) {
      throw new ProblemException({
        type: problemTypes.validation,
        title: "Invalid payload",
        status: 400,
        detail: "orderId is required",
      });
    }
    const session = await this.payments.createCheckoutSession(body.orderId);
    return session;
  }

  @Public()
  @Post("stripe/webhook")
  async webhook(@Req() req: any, @Headers("stripe-signature") signature: string | undefined) {
    const rawBody: Buffer = req.rawBody
      ? Buffer.isBuffer(req.rawBody)
        ? req.rawBody
        : Buffer.from(req.rawBody)
      : Buffer.from(JSON.stringify(req.body ?? {}));
    return this.payments.handleStripeWebhook(rawBody, signature);
  }
}
