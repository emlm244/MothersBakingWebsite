import { Module, OnModuleInit } from "@nestjs/common";
import { MailerService } from "./mailer.service";

@Module({
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule implements OnModuleInit {
  constructor(private readonly mailer: MailerService) {}

  async onModuleInit() {
    await this.mailer.init();
  }
}
