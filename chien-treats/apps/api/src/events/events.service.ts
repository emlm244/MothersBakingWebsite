import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { EVENT_CHANNELS, EventChannel, ServerEvent } from "./events.constants";

@Injectable()
export class EventsService {
  constructor(private readonly emitter: EventEmitter2) {}

  emit<T>(channel: EventChannel, type: string, payload: T) {
    const event: ServerEvent<T> = {
      channel,
      type,
      payload,
      at: new Date().toISOString(),
    };
    this.emitter.emit(this.topic(channel), event);
  }

  on<T>(channel: EventChannel, listener: (event: ServerEvent<T>) => void) {
    const topic = this.topic(channel);
    this.emitter.on(topic, listener as (...args: unknown[]) => void);
    return () => this.emitter.off(topic, listener as (...args: unknown[]) => void);
  }

  validateChannels(requested: string[] | undefined): EventChannel[] {
    if (!requested?.length) {
      return [...EVENT_CHANNELS];
    }
    return requested
      .map((channel) => channel.trim())
      .filter((channel): channel is EventChannel => EVENT_CHANNELS.includes(channel as EventChannel));
  }

  private topic(channel: EventChannel) {
    return `events.${channel}`;
  }
}
