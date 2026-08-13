import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const token = authorization.replace("Bearer ", "");
    req.user = verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

export const optionalAuthenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return next();
  }

  try {
    const token = authorization.replace("Bearer ", "");
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalido" });
  }
};
