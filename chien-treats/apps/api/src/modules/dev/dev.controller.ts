import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MailerService } from "../../mailer/mailer.service";
import { Public } from "../../common/decorators/public.decorator";

@Controller({ path: "dev" })
export class DevController {
  constructor(private readonly mailer: MailerService, private readonly config: ConfigService) {}

  @Public()
  @Get("emails")
  async listEmails() {
    const env = this.config.get<string>("app.env") ?? "development";
    if (env !== "development" && env !== "test") {
      return { emails: [] };
    }
    const emails = await this.mailer.listDevEmails();
    return { emails };
  }
}
