"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthenticate = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No autorizado" });
    }
    try {
        const token = authorization.replace("Bearer ", "");
        req.user = (0, jwt_1.verifyToken)(token);
        next();
    }
    catch (error) {
        return res.status(401).json({ error: "Token inválido" });
    }
};
exports.authenticate = authenticate;
const optionalAuthenticate = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
        return next();
    }
    try {
        const token = authorization.replace("Bearer ", "");
        req.user = (0, jwt_1.verifyToken)(token);
        return next();
    }
    catch (error) {
        return res.status(401).json({ error: "Token invalido" });
    }
};
exports.optionalAuthenticate = optionalAuthenticate;
