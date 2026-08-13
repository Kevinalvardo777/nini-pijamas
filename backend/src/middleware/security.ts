import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

const localhostOrigins = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"];

export function getAllowedOrigins() {
  const configured = [process.env.FRONTEND_URL, process.env.CORS_ORIGINS]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  if (configured.length > 0) return configured;
  return process.env.NODE_ENV === "production" ? [] : localhostOrigins;
}

export function corsOrigin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
  if (!origin) {
    callback(null, true);
    return;
  }

  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  logger.warn("cors_blocked_origin", { origin, allowedOrigins });
  callback(new Error("Origen no permitido por CORS"));
}

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("X-DNS-Prefetch-Control", "off");

  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }

  next();
}
