"use client";

import { useEffect } from "react";
import { reportClientEvent } from "../lib/client-logger";

export default function ClientTelemetry() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      reportClientEvent({
        level: "error",
        event: "window_error",
        message: event.message,
        stack: event.error?.stack,
        metadata: { filename: event.filename, lineno: event.lineno, colno: event.colno }
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      reportClientEvent({
        level: "error",
        event: "unhandled_rejection",
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
