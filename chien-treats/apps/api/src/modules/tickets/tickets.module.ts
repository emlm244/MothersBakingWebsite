import { Module } from "@nestjs/common";
import { TicketsController } from "./tickets.controller";
import { TicketsService } from "./tickets.service";
import { EventsModule } from "../../events/events.module";
import { StorageModule } from "../../storage/storage.module";
import { MailerModule } from "../../mailer/mailer.module";
import { TicketNotificationsService } from "./ticket-notifications.service";

@Module({
  imports: [EventsModule, StorageModule, MailerModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketNotificationsService],
  exports: [TicketsService],
})
export class TicketsModule {}
