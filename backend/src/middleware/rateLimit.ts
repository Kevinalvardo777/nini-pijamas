import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyPrefix: string;
};

const buckets = new Map<string, Bucket>();

function cleanup(now: number) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit({ windowMs, max, keyPrefix }: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    cleanup(now);

    const key = `${keyPrefix}:${req.ip}`;
    const current = buckets.get(key) ?? { count: 0, resetAt: now + windowMs };
    current.count += 1;
    buckets.set(key, current);

    const remaining = Math.max(0, max - current.count);
    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader("RateLimit-Reset", String(Math.ceil(current.resetAt / 1000)));

    if (current.count > max) {
      logger.warn("rate_limit_exceeded", { keyPrefix, ip: req.ip, path: req.originalUrl });
      return res.status(429).json({ error: "Demasiadas solicitudes. Intenta de nuevo en unos minutos." });
    }

    next();
  };
}
