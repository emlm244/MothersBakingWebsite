import { Controller, Get, Header, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MetricsService } from "./metrics.service";

@Controller()
export class MetricsController {
  constructor(
    private readonly metrics: MetricsService,
    private readonly config: ConfigService,
  ) {}

  @Get("/metrics")
  @Header("Content-Type", "text/plain; version=0.0.4")
  async getMetrics(): Promise<string> {
    const enabled = this.config.get<boolean>("app.metrics.enabled");
    if (!enabled) {
      throw new NotFoundException();
    }
    return this.metrics.getMetrics();
  }
}
