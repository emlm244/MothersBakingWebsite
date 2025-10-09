import { Injectable } from "@nestjs/common";
import { collectDefaultMetrics, Counter, Histogram, Registry } from "prom-client";

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();
  private readonly httpRequestHistogram: Histogram<string>;
  private readonly httpErrorCounter: Counter<string>;

  constructor() {
    collectDefaultMetrics({ register: this.registry });

    this.httpRequestHistogram = new Histogram({
      name: "http_request_duration_seconds",
      help: "HTTP request duration in seconds",
      labelNames: ["method", "path", "status"],
      registers: [this.registry],
      buckets: [0.05, 0.1, 0.3, 0.5, 0.75, 1, 2, 5],
    });

    this.httpErrorCounter = new Counter({
      name: "http_request_errors_total",
      help: "Total number of HTTP error responses",
      labelNames: ["method", "path", "status"],
      registers: [this.registry],
    });
  }

  observeRequest(method: string, path: string, status: number, durationMs: number) {
    this.httpRequestHistogram.observe({ method, path, status: status.toString() }, durationMs / 1000);
    if (status >= 400) {
      this.httpErrorCounter.inc({ method, path, status: status.toString() });
    }
  }

  async getMetrics() {
    return this.registry.metrics();
  }
}
