"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const rateLimit_1 = require("../middleware/rateLimit");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const clientEventSchema = zod_1.z.object({
    level: zod_1.z.enum(["info", "warn", "error"]).default("info"),
    event: zod_1.z.string().min(1).max(120),
    message: zod_1.z.string().max(1000).optional(),
    path: zod_1.z.string().max(500).optional(),
    requestId: zod_1.z.string().max(100).optional(),
    stack: zod_1.z.string().max(4000).optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional()
});
router.post("/", (0, rateLimit_1.rateLimit)({ keyPrefix: "client-events", windowMs: 60000, max: 120 }), (req, res) => {
    const parsed = clientEventSchema.parse(req.body);
    logger_1.logger[parsed.level]("client_event", {
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
exports.default = router;
