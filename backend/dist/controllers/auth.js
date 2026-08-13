"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutController = exports.meController = exports.loginController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
const jwt_1 = require("../utils/jwt");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8)
});
const loginController = async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Credenciales inválidas" });
    }
    const { email, password } = parsed.data;
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }
    const isValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }
    const token = (0, jwt_1.signToken)({ userId: user.id, role: user.role });
    res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};
exports.loginController = loginController;
const meController = async (req, res) => {
    const authReq = req;
    const userId = authReq.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: "No autorizado" });
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true }
    });
    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({ user });
};
exports.meController = meController;
const logoutController = async (_req, res) => {
    res.json({ message: "Sesión cerrada" });
};
exports.logoutController = logoutController;
