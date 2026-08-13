type LogLevel = "debug" | "info" | "warn" | "error";

type LogFields = Record<string, unknown>;

const redactKeys = ["authorization", "password", "token", "jwt", "secret", "receiptUrl"];

function redact(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(redact);

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      redactKeys.some((redactKey) => key.toLowerCase().includes(redactKey.toLowerCase())) ? "[REDACTED]" : redact(entry)
    ])
  );
}

function write(level: LogLevel, message: string, fields: LogFields = {}) {
  const safeFields = redact(fields) as LogFields;
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: "nini-pijamas-backend",
    ...safeFields
  };

  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}

export const logger = {
  debug: (message: string, fields?: LogFields) => write("debug", message, fields),
  info: (message: string, fields?: LogFields) => write("info", message, fields),
  warn: (message: string, fields?: LogFields) => write("warn", message, fields),
  error: (message: string, fields?: LogFields) => write("error", message, fields)
};
