"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "No autorizado" });
        }
        if (req.user.role !== role) {
            return res.status(403).json({ error: "Acceso denegado" });
        }
        next();
    };
};
exports.requireRole = requireRole;
