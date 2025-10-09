import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { ContentService } from "./content.service";
import { Public } from "../../common/decorators/public.decorator";
import { ContentUpsertDto } from "./dto/content.dto";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller({ path: "content" })
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Public()
  @Get(":key")
  async get(@Param("key") key: string) {
    const block = await this.content.get(key);
    return { block };
  }

  @Roles("admin", "staff")
  @Put(":key")
  async upsert(@Param("key") key: string, @Body() dto: ContentUpsertDto) {
    const block = await this.content.upsert(key, dto);
    return { block };
  }
}
