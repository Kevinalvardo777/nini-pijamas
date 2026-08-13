import { Router } from "express";
import { z } from "zod";
import { rateLimit } from "../middleware/rateLimit";
import { logger } from "../utils/logger";

const router = Router();

const clientEventSchema = z.object({
  level: z.enum(["info", "warn", "error"]).default("info"),
  event: z.string().min(1).max(120),
  message: z.string().max(1000).optional(),
  path: z.string().max(500).optional(),
  requestId: z.string().max(100).optional(),
  stack: z.string().max(4000).optional(),
  metadata: z.record(z.unknown()).optional()
});

router.post("/", rateLimit({ keyPrefix: "client-events", windowMs: 60_000, max: 120 }), (req, res) => {
  const parsed = clientEventSchema.parse(req.body);
  logger[parsed.level]("client_event", {
    event: parsed.event,
    message: parsed.message,
    path: parsed.path,
    requestId: parsed.requestId,
    stack: parsed.stack,
    metadata: parsed.metadata,
    userAgent: req.header("user-agent"),
    ip: req.ip
  });
  res.status(202).json({ accepted: true });
});

export default router;
