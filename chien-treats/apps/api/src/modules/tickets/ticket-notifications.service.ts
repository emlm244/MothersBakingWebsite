import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import type { Ticket as TicketResponse } from "@data";
import { MailerService } from "../../mailer/mailer.service";

interface TicketNotificationJob {
  to: string;
  title: string;
  number: string;
  status: string;
}

@Injectable()
export class TicketNotificationsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TicketNotificationsService.name);
  private readonly queueName = "ticket-updates";
  private queue?: Queue<TicketNotificationJob>;
  private worker?: Worker<TicketNotificationJob>;
  private queueConnection?: Redis;
  private workerConnection?: Redis;

  constructor(private readonly config: ConfigService, private readonly mailer: MailerService) {}

  async onModuleInit() {
    const redisUrl = this.config.get<string>("app.redisUrl");
    if (!redisUrl) {
      this.logger.warn("REDIS_URL not configured; ticket update notifications will send immediately.");
      return;
    }

    try {
      this.queueConnection = new Redis(redisUrl, { maxRetriesPerRequest: 2 });
      this.workerConnection = new Redis(redisUrl, { maxRetriesPerRequest: 2 });
      this.queue = new Queue<TicketNotificationJob>(this.queueName, {
        connection: this.queueConnection,
      });
      this.worker = new Worker<TicketNotificationJob>(
        this.queueName,
        async (job) => {
          await this.mailer.sendTicketUpdated({
            to: job.data.to,
            title: job.data.title,
            number: job.data.number,
            status: job.data.status,
          });
        },
        {
          connection: this.workerConnection,
        },
      );

      this.worker.on("failed", (job, error) => {
        this.logger.error(`Ticket update email failed (job ${job?.id})`, error as Error);
      });
    } catch (error) {
      this.logger.error("Failed to initialize BullMQ queue; falling back to synchronous emails", error as Error);
      await this.workerConnection?.quit();
      await this.queueConnection?.quit();
      this.worker = undefined;
      this.queue = undefined;
      this.workerConnection = undefined;
      this.queueConnection = undefined;
    }
  }

  async onModuleDestroy() {
    await this.worker?.close();
    await this.queue?.close();
    await this.workerConnection?.quit();
    await this.queueConnection?.quit();
  }

  async enqueueTicketUpdate(ticket: TicketResponse) {
    if (!ticket.requesterEmail) {
      return;
    }

    if (this.queue) {
      await this.queue.add(
        "ticket-updated",
        {
          to: ticket.requesterEmail,
          title: ticket.title,
          number: ticket.number,
          status: ticket.status,
        },
        {
          removeOnComplete: true,
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
        },
      );
      return;
    }

    await this.mailer.sendTicketUpdated({
      to: ticket.requesterEmail,
      title: ticket.title,
      number: ticket.number,
      status: ticket.status,
    });
  }
}
