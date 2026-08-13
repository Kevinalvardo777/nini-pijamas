"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const redactKeys = ["authorization", "password", "token", "jwt", "secret", "receiptUrl"];
function redact(value) {
    if (!value || typeof value !== "object")
        return value;
    if (Array.isArray(value))
        return value.map(redact);
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
        key,
        redactKeys.some((redactKey) => key.toLowerCase().includes(redactKey.toLowerCase())) ? "[REDACTED]" : redact(entry)
    ]));
}
function write(level, message, fields = {}) {
    const safeFields = redact(fields);
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
exports.logger = {
    debug: (message, fields) => write("debug", message, fields),
    info: (message, fields) => write("info", message, fields),
    warn: (message, fields) => write("warn", message, fields),
    error: (message, fields) => write("error", message, fields)
};
