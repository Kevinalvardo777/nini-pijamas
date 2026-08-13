"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const zod_1 = require("zod");
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const cart_1 = __importDefault(require("./routes/cart"));
const orders_1 = __importDefault(require("./routes/orders"));
const admin_1 = __importDefault(require("./routes/admin"));
const whatsapp_1 = __importDefault(require("./routes/whatsapp"));
const clientEvents_1 = __importDefault(require("./routes/clientEvents"));
const openapi_1 = require("./openapi");
const requestContext_1 = require("./middleware/requestContext");
const security_1 = require("./middleware/security");
const rateLimit_1 = require("./middleware/rateLimit");
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
app.disable("x-powered-by");
app.use(requestContext_1.requestContext);
app.use(security_1.securityHeaders);
app.use((0, cors_1.default)({ origin: security_1.corsOrigin, credentials: true }));
app.use(express_1.default.json({ limit: process.env.REQUEST_BODY_LIMIT ?? "5mb" }));
app.use("/api/auth", (0, rateLimit_1.rateLimit)({ keyPrefix: "auth", windowMs: 15 * 60000, max: 80 }), auth_1.default);
app.use("/api/products", products_1.default);
app.use("/api/cart", cart_1.default);
app.use("/api/orders", orders_1.default);
app.use("/api/admin", admin_1.default);
app.use("/api/whatsapp", whatsapp_1.default);
app.use("/api/client-events", clientEvents_1.default);
app.get(["/api", "/api/"], (_, res) => res.redirect("/api/docs"));
app.get("/api/health", (_, res) => res.json({ status: "ok" }));
app.get("/api/openapi.json", (_, res) => res.json(openapi_1.openApiSpec));
app.get("/api/docs", (_, res) => res.type("html").send(openapi_1.openApiHtml));
app.use((err, _req, res, _next) => {
    logger_1.logger.error("unhandled_request_error", {
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
        status: err?.status
    });
    if (err instanceof zod_1.ZodError) {
        const message = err.errors.map((issue) => issue.message).join(". ");
        return res.status(400).json({ error: message || "Datos invalidos" });
    }
    res.status(err.status ?? 500).json({ error: err.message ?? "Error interno" });
});
exports.default = app;
