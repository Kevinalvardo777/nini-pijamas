"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const zod_1 = require("zod");
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const cart_1 = __importDefault(require("./routes/cart"));
const orders_1 = __importDefault(require("./routes/orders"));
const admin_1 = __importDefault(require("./routes/admin"));
const whatsapp_1 = __importDefault(require("./routes/whatsapp"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json({ limit: "25mb" }));
app.use((0, morgan_1.default)("tiny"));
app.use("/api/auth", auth_1.default);
app.use("/api/products", products_1.default);
app.use("/api/cart", cart_1.default);
app.use("/api/orders", orders_1.default);
app.use("/api/admin", admin_1.default);
app.use("/api/whatsapp", whatsapp_1.default);
app.get("/api/health", (_, res) => res.json({ status: "ok" }));
app.use((err, _req, res, _next) => {
    console.error(err);
    if (err instanceof zod_1.ZodError) {
        const message = err.errors.map((issue) => issue.message).join(". ");
        return res.status(400).json({ error: message || "Datos invalidos" });
    }
    res.status(err.status ?? 500).json({ error: err.message ?? "Error interno" });
});
exports.default = app;
