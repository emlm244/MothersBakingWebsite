import { Module, OnModuleInit } from "@nestjs/common";
import { StorageService } from "./storage.service";

@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule implements OnModuleInit {
  constructor(private readonly storage: StorageService) {}

  async onModuleInit() {
    await this.storage.init();
  }
}
