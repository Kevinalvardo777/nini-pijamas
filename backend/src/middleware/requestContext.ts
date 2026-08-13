import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export interface RequestWithContext extends Request {
  requestId?: string;
  startedAt?: number;
}

export function requestContext(req: RequestWithContext, res: Response, next: NextFunction) {
  const incomingRequestId = req.header("x-request-id");
  const requestId = incomingRequestId && incomingRequestId.length <= 80 ? incomingRequestId : randomUUID();
  req.requestId = requestId;
  req.startedAt = Date.now();
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    const durationMs = Date.now() - (req.startedAt ?? Date.now());
    logger.info("http_request", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
      userAgent: req.header("user-agent")
    });
  });

  next();
}
