import { apiUrl } from "./api";
import { getClientRequestId } from "./request-id";

type ClientLogLevel = "info" | "warn" | "error";

type ClientLogInput = {
  level?: ClientLogLevel;
  event: string;
  message?: string;
  stack?: string;
  metadata?: Record<string, unknown>;
};

export function reportClientEvent(input: ClientLogInput) {
  if (typeof window === "undefined") return;

  const payload = {
    level: input.level ?? "info",
    event: input.event,
    message: input.message,
    stack: input.stack,
    path: window.location.pathname + window.location.search,
    requestId: getClientRequestId(),
    metadata: input.metadata
  };

  const body = JSON.stringify(payload);
  const url = `${apiUrl}/client-events`;

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    return;
  }

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch(() => undefined);
}
