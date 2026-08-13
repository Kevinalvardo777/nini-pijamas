import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth";
import { sendOrderWhatsApp, sendDeliveryWhatsApp } from "./whatsapp";
import { sendPaymentReceiptEmail } from "../utils/email";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  quantity: z.coerce.number().int().min(1),
  size: z.string().min(1),
  color: z.string().min(1)
});

const orderSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  address: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().min(3),
  notes: z.string().optional(),
  shippingMethod: z.enum(["pickup", "standard", "express"]).optional(),
  paymentMethod: z.enum(["transferencia", "tienda", "mock", "pasarela"]),
  receiptUrl: z.string().min(1).optional(),
  items: z.array(orderItemSchema).optional()
});

const formatOrderNumber = () => `NP-${Date.now()}`;
const shippingMethods = {
  pickup: { label: "Retiro en tienda", price: 0 },
  standard: { label: "Envio estandar", price: 5.9 },
  express: { label: "Envio express", price: 8.9 }
};

export const createOrderController = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user?.userId;
  const validation = orderSchema.safeParse(req.body);

  if (!validation.success) {
    const error = validation.error.errors.map((issue) => issue.message).join(". ");
    return res.status(400).json({ error: error || "Datos invalidos" });
  }

  const parsed = validation.data;
  if (parsed.paymentMethod === "pasarela") {
    return res.status(400).json({ error: "La pasarela de pago aun no esta habilitada" });
  }
  if (parsed.paymentMethod === "transferencia" && !parsed.receiptUrl) {
    return res.status(400).json({ error: "Sube el comprobante de transferencia" });
  }

  const cart = userId
    ? await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } }
      })
    : null;

  const orderItems = parsed.items?.length
    ? parsed.items
    : cart?.items.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        size: item.size,
        color: item.color
      })) ?? [];

  if (orderItems.length === 0) {
    return res.status(400).json({ error: "Carrito vacío" });
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingMethod = parsed.shippingMethod ?? "standard";
  const shipping = shippingMethods[shippingMethod].price;
  const discount = 0;
  const total = subtotal + shipping - discount;
  const orderNumber = formatOrderNumber();
  const notes = [`Metodo de envio: ${shippingMethods[shippingMethod].label}`, parsed.notes].filter(Boolean).join("\n");

  const createdOrder = await prisma.order.create({
    data: {
      number: orderNumber,
      userId: userId ?? null,
      status: parsed.paymentMethod === "mock" ? "PAID" : "PENDING",
      subtotal,
      shipping,
      discount,
      total,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      phone: parsed.phone,
      address: parsed.address,
      city: parsed.city,
      postalCode: parsed.postalCode,
      notes,
      items: {
        create: orderItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color
        }))
      },
      payment: {
        create: {
          method: parsed.paymentMethod,
          status: parsed.paymentMethod === "mock" ? "SUCCESS" : parsed.paymentMethod === "transferencia" ? "PENDING_REVIEW" : "PENDING",
          reference: `${parsed.paymentMethod.toUpperCase()}-${Date.now()}`,
          receiptUrl: parsed.receiptUrl
        }
      },
      shipment: {
        create: {
          trackingCode: `TRK-${Date.now()}`
        }
      }
    },
    include: { items: true, payment: true, shipment: true }
  });

  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  try {
    await sendOrderWhatsApp(createdOrder);
    await sendDeliveryWhatsApp(createdOrder);
  } catch (error) {
    console.error("No se pudo enviar WhatsApp del pedido", error);
  }

  try {
    await sendPaymentReceiptEmail(createdOrder);
  } catch (error) {
    console.error("No se pudo enviar correo del comprobante", error);
  }

  res.status(201).json({ order: createdOrder });
};

export const getOrdersController = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { userId, role } = authReq.user!;

  const where = role === "ADMIN" ? {} : { userId };
  const orders = await prisma.order.findMany({
    where,
    include: { items: true, payment: true, shipment: true },
    orderBy: { createdAt: "desc" }
  });

  res.json({ orders });
};

export const getOrderController = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { userId, role } = authReq.user!;
  const { orderId } = req.params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payment: true, shipment: true }
  });

  if (!order) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }
  if (role !== "ADMIN" && order.userId !== userId) {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  res.json({ order });
};

export const updateOrderStatusController = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body as { status?: string };
  if (!status) {
    return res.status(400).json({ error: "Estado es requerido" });
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { shipment: true }
  });

  if (order.shipment) {
    await prisma.shipment.update({
      where: { orderId: order.id },
      data: { status: status === "SHIPPED" ? "IN_ROUTE" : status === "DELIVERED" ? "DELIVERED" : order.shipment.status }
    });
  }

  res.json({ order });
};
