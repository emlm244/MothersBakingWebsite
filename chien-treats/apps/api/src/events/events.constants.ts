export const EVENT_CHANNELS = ["orders", "reviews", "tickets"] as const;
export type EventChannel = (typeof EVENT_CHANNELS)[number];

export interface ServerEvent<TPayload = unknown> {
  channel: EventChannel;
  type: string;
  payload: TPayload;
  at: string;
}
