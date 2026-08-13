import { Request, Response } from "express";
export declare const listProductsController: (req: Request, res: Response) => Promise<void>;
export declare const getProductController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createProductController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateProductController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteProductController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
