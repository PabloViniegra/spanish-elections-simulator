import type { BeforeSendEvent } from "@vercel/analytics/next";

export function redactAnalyticsQuery(event: BeforeSendEvent): BeforeSendEvent {
  const url = new URL(event.url);
  url.search = "";
  return { ...event, url: url.toString() };
}
