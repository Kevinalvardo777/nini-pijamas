import { Request, Response } from "express";
export declare const getCartController: (req: Request, res: Response) => Promise<void>;
export declare const addCartItemController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCartItemController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const removeCartItemController: (req: Request, res: Response) => Promise<void>;
export declare const clearCartController: (req: Request, res: Response) => Promise<void>;
