"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("./logger");
const JWT_SECRET = process.env.JWT_SECRET ?? "change_this_secret";
if (process.env.NODE_ENV === "production" && (JWT_SECRET === "change_this_secret" || JWT_SECRET.length < 32)) {
    throw new Error("JWT_SECRET debe estar configurado y tener al menos 32 caracteres en produccion.");
}
if (process.env.NODE_ENV !== "production" && JWT_SECRET === "change_this_secret") {
    logger_1.logger.warn("jwt_secret_using_development_fallback");
}
const signToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};
exports.signToken = signToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyToken = verifyToken;
