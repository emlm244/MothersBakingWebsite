import { Controller, Get } from "@nestjs/common";
import { HealthService } from "./health.service";

@Controller()
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get("/healthz")
  liveness() {
    return this.health.liveness();
  }

  @Get("/readyz")
  readiness() {
    return this.health.readiness();
  }
}
