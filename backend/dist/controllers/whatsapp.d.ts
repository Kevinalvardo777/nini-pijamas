import { Request, Response } from "express";
export declare const sendOrderWhatsApp: (order: any) => Promise<any>;
export declare const sendDeliveryWhatsApp: (order: any) => Promise<any>;
export declare const sendWhatsappMessage: (phone: string, message: string) => Promise<any>;
export declare const sendOrderMessageController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const sendDeliveryMessageController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
