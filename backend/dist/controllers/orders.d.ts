import { Request, Response } from "express";
export declare const createOrderController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getOrdersController: (req: Request, res: Response) => Promise<void>;
export declare const getOrderController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateOrderStatusController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
