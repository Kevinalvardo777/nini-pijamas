import express from "express";
import cors from "cors";
import morgan from "morgan";
import { ZodError } from "zod";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import orderRoutes from "./routes/orders";
import adminRoutes from "./routes/admin";
import whatsappRoutes from "./routes/whatsapp";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "25mb" }));
app.use(morgan("tiny"));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/whatsapp", whatsappRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  if (err instanceof ZodError) {
    const message = err.errors.map((issue) => issue.message).join(". ");
    return res.status(400).json({ error: message || "Datos invalidos" });
  }
  res.status(err.status ?? 500).json({ error: err.message ?? "Error interno" });
});

export default app;
