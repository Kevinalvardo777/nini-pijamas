import { NextFunction, Request, Response } from "express";
type RateLimitOptions = {
    windowMs: number;
    max: number;
    keyPrefix: string;
};
export declare function rateLimit({ windowMs, max, keyPrefix }: RateLimitOptions): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
