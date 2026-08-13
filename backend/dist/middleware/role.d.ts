import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
export declare const requireRole: (role: string) => (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
