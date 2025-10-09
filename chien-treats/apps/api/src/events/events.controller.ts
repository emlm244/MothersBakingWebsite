import { Controller, Get, Query, Res } from "@nestjs/common";
import { EventsService } from "./events.service";
import type { FastifyReply } from "fastify";
import { Public } from "../common/decorators/public.decorator";

@Controller({ path: "events" })
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Public()
  @Get()
  sse(@Query("channels") channelsParam: string | string[] | undefined, @Res() res: FastifyReply) {
    const reply = res.raw;
    const channels = this.events.validateChannels(this.toArray(channelsParam));

    reply.setHeader("Content-Type", "text/event-stream");
    reply.setHeader("Cache-Control", "no-cache");
    reply.setHeader("Connection", "keep-alive");

    const send = (event: unknown) => {
      reply.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    const unsubscribes = channels.map((channel) =>
      this.events.on(channel, (event) => {
        send(event);
      }),
    );

    reply.write(":ok\n\n");

    const keepAlive = setInterval(() => reply.write(":keep-alive\n\n"), 15000);

    const cleanup = () => {
      clearInterval(keepAlive);
      unsubscribes.forEach((off) => off());
      reply.end();
    };

    reply.on("close", cleanup);
    reply.on("error", cleanup);

    return res;
  }

  private toArray(param: string | string[] | undefined) {
    if (!param) return undefined;
    if (Array.isArray(param)) {
      return param;
    }
    return param.split(",").map((item) => item.trim()).filter(Boolean);
  }
}
