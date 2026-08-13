import { NextFunction, Request, Response } from "express";
export interface RequestWithContext extends Request {
    requestId?: string;
    startedAt?: number;
}
export declare function requestContext(req: RequestWithContext, res: Response, next: NextFunction): void;
