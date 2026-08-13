import jwt from "jsonwebtoken";
import { logger } from "./logger";

const JWT_SECRET = process.env.JWT_SECRET ?? "change_this_secret";

if (process.env.NODE_ENV === "production" && (JWT_SECRET === "change_this_secret" || JWT_SECRET.length < 32)) {
  throw new Error("JWT_SECRET debe estar configurado y tener al menos 32 caracteres en produccion.");
}

if (process.env.NODE_ENV !== "production" && JWT_SECRET === "change_this_secret") {
  logger.warn("jwt_secret_using_development_fallback");
}

export const signToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
};
