import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { signToken } from "../utils/jwt";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const loginController = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Credenciales inválidas" });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Email o contraseña incorrectos" });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: "Email o contraseña incorrectos" });
  }

  const token = signToken({ userId: user.id, role: user.role });
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

export const meController = async (req: Request, res: Response) => {
  const authReq = req as any;
  const userId = authReq.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true }
  });

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  res.json({ user });
};

export const logoutController = async (_req: Request, res: Response) => {
  res.json({ message: "Sesión cerrada" });
};
