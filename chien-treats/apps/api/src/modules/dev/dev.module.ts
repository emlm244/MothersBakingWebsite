import { Module } from "@nestjs/common";
import { DevController } from "./dev.controller";
import { MailerModule } from "../../mailer/mailer.module";

@Module({
  imports: [MailerModule],
  controllers: [DevController],
})
export class DevModule {}
