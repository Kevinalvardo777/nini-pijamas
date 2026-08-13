"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestContext = requestContext;
const crypto_1 = require("crypto");
const logger_1 = require("../utils/logger");
function requestContext(req, res, next) {
    const incomingRequestId = req.header("x-request-id");
    const requestId = incomingRequestId && incomingRequestId.length <= 80 ? incomingRequestId : (0, crypto_1.randomUUID)();
    req.requestId = requestId;
    req.startedAt = Date.now();
    res.setHeader("X-Request-Id", requestId);
    res.on("finish", () => {
        const durationMs = Date.now() - (req.startedAt ?? Date.now());
        logger_1.logger.info("http_request", {
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
