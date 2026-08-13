import { Request, Response } from "express";
export declare const loginController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const meController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const logoutController: (_req: Request, res: Response) => Promise<void>;
