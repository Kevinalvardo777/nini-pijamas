import express from "express";
import cors from "cors";
import { ZodError } from "zod";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import orderRoutes from "./routes/orders";
import adminRoutes from "./routes/admin";
import whatsappRoutes from "./routes/whatsapp";
import clientEventRoutes from "./routes/clientEvents";
import { openApiHtml, openApiSpec } from "./openapi";
import { requestContext } from "./middleware/requestContext";
import { corsOrigin, securityHeaders } from "./middleware/security";
import { rateLimit } from "./middleware/rateLimit";
import { logger } from "./utils/logger";

const app = express();

app.disable("x-powered-by");
app.use(requestContext);
app.use(securityHeaders);
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: process.env.REQUEST_BODY_LIMIT ?? "5mb" }));

app.use("/api/auth", rateLimit({ keyPrefix: "auth", windowMs: 15 * 60_000, max: 80 }), authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/client-events", clientEventRoutes);

app.get(["/api", "/api/"], (_, res) => res.redirect("/api/docs"));
app.get("/api/health", (_, res) => res.json({ status: "ok" }));
app.get("/api/openapi.json", (_, res) => res.json(openApiSpec));
app.get("/api/docs", (_, res) => res.type("html").send(openApiHtml));

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error("unhandled_request_error", {
    name: err?.name,
    message: err?.message,
    stack: err?.stack,
    status: err?.status
  });
  if (err instanceof ZodError) {
    const message = err.errors.map((issue) => issue.message).join(". ");
    return res.status(400).json({ error: message || "Datos invalidos" });
  }
  res.status(err.status ?? 500).json({ error: err.message ?? "Error interno" });
});

export default app;
