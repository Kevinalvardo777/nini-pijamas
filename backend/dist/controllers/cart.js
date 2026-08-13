"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCartController = exports.removeCartItemController = exports.updateCartItemController = exports.addCartItemController = exports.getCartController = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
const cartItemSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().min(1),
    size: zod_1.z.string().min(1),
    color: zod_1.z.string().min(1)
});
const getCartController = async (req, res) => {
    const authReq = req;
    const userId = authReq.user?.userId;
    const cart = await prisma_1.prisma.cart.findUnique({
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
exports.getCartController = getCartController;
const findOrCreateCart = async (userId) => {
    return prisma_1.prisma.cart.upsert({
        where: { userId },
        update: {},
        create: { userId }
    });
};
const addCartItemController = async (req, res) => {
    const authReq = req;
    const userId = authReq.user?.userId;
    const parsed = cartItemSchema.parse(req.body);
    const product = await prisma_1.prisma.product.findUnique({ where: { id: parsed.productId } });
    if (!product || !product.active) {
        return res.status(404).json({ error: "Producto no disponible" });
    }
    const cart = await findOrCreateCart(userId);
    const existingItem = await prisma_1.prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            productId: parsed.productId,
            size: parsed.size,
            color: parsed.color
        }
    });
    if (existingItem) {
        const updated = await prisma_1.prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + parsed.quantity }
        });
        return res.json({ item: updated });
    }
    const item = await prisma_1.prisma.cartItem.create({
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
exports.addCartItemController = addCartItemController;
const updateCartItemController = async (req, res) => {
    const { itemId } = req.params;
    const parsed = cartItemSchema.pick({ quantity: true }).parse(req.body);
    const item = await prisma_1.prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item) {
        return res.status(404).json({ error: "Elemento no encontrado" });
    }
    const updated = await prisma_1.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: parsed.quantity }
    });
    res.json({ item: updated });
};
exports.updateCartItemController = updateCartItemController;
const removeCartItemController = async (req, res) => {
    const { itemId } = req.params;
    await prisma_1.prisma.cartItem.delete({ where: { id: itemId } });
    res.json({ message: "Elemento eliminado" });
};
exports.removeCartItemController = removeCartItemController;
const clearCartController = async (req, res) => {
    const authReq = req;
    const userId = authReq.user?.userId;
    const cart = await prisma_1.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
        await prisma_1.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    res.json({ message: "Carrito vaciado" });
};
exports.clearCartController = clearCartController;
