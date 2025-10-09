import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { CouponsModule } from "../coupons/coupons.module";
import { EventsModule } from "../../events/events.module";
import { MailerModule } from "../../mailer/mailer.module";

@Module({
  imports: [CouponsModule, EventsModule, MailerModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
