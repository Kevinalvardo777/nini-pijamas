import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth";

const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  size: z.string().min(1),
  color: z.string().min(1)
});

export const getCartController = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user?.userId;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: { include: { images: { orderBy: [{ isPrimary: "desc" }, { position: "asc" }] } } } } } }
  });

  const items = cart?.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.product.name,
    price: item.product.price,
    oldPrice: item.product.oldPrice,
    quantity: item.quantity,
    size: item.size,
    color: item.color,
    image: item.product.images[0]?.url ?? ""
  })) ?? [];

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = items.length > 0 ? 5.9 : 0;
  const discount = 0;
  const total = subtotal + shipping - discount;

  res.json({ items, subtotal, shipping, discount, total });
};

const findOrCreateCart = async (userId: string) => {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId }
  });
};

export const addCartItemController = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user?.userId;
  const parsed = cartItemSchema.parse(req.body);

  const product = await prisma.product.findUnique({ where: { id: parsed.productId } });
  if (!product || !product.active) {
    return res.status(404).json({ error: "Producto no disponible" });
  }

  const cart = await findOrCreateCart(userId!);

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: parsed.productId,
      size: parsed.size,
      color: parsed.color
    }
  });

  if (existingItem) {
    const updated = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + parsed.quantity }
    });
    return res.json({ item: updated });
  }

  const item = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: parsed.productId,
      quantity: parsed.quantity,
      size: parsed.size,
      color: parsed.color
    }
  });

  res.status(201).json({ item });
};

export const updateCartItemController = async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const parsed = cartItemSchema.pick({ quantity: true }).parse(req.body);

  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item) {
    return res.status(404).json({ error: "Elemento no encontrado" });
  }

  const updated = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity: parsed.quantity }
  });

  res.json({ item: updated });
};

export const removeCartItemController = async (req: Request, res: Response) => {
  const { itemId } = req.params;
  await prisma.cartItem.delete({ where: { id: itemId } });
  res.json({ message: "Elemento eliminado" });
};

export const clearCartController = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user?.userId;

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  res.json({ message: "Carrito vaciado" });
};
