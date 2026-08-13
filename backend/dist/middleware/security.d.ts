import { NextFunction, Request, Response } from "express";
export declare function getAllowedOrigins(): string[];
export declare function corsOrigin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void;
export declare function securityHeaders(_req: Request, res: Response, next: NextFunction): void;
