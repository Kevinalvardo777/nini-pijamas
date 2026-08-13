"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusController = exports.getOrderController = exports.getOrdersController = exports.createOrderController = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
const whatsapp_1 = require("./whatsapp");
const email_1 = require("../utils/email");
const orderItemSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    price: zod_1.z.coerce.number().nonnegative(),
    quantity: zod_1.z.coerce.number().int().min(1),
    size: zod_1.z.string().min(1),
    color: zod_1.z.string().min(1)
});
const orderSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(7),
    address: zod_1.z.string().min(5),
    city: zod_1.z.string().min(2),
    postalCode: zod_1.z.string().min(3),
    notes: zod_1.z.string().optional(),
    shippingMethod: zod_1.z.enum(["pickup", "standard", "express"]).optional(),
    paymentMethod: zod_1.z.enum(["transferencia", "tienda", "mock", "pasarela"]),
    receiptUrl: zod_1.z.string().min(1).optional(),
    items: zod_1.z.array(orderItemSchema).optional()
});
const formatOrderNumber = () => `NP-${Date.now()}`;
const shippingMethods = {
    pickup: { label: "Retiro en tienda", price: 0 },
    standard: { label: "Envio estandar", price: 5.9 },
    express: { label: "Envio express", price: 8.9 }
};
const createOrderController = async (req, res) => {
    const authReq = req;
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
        ? await prisma_1.prisma.cart.findUnique({
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
    const createdOrder = await prisma_1.prisma.order.create({
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
        await prisma_1.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    try {
        await (0, whatsapp_1.sendOrderWhatsApp)(createdOrder);
        await (0, whatsapp_1.sendDeliveryWhatsApp)(createdOrder);
    }
    catch (error) {
        console.error("No se pudo enviar WhatsApp del pedido", error);
    }
    try {
        await (0, email_1.sendPaymentReceiptEmail)(createdOrder);
    }
    catch (error) {
        console.error("No se pudo enviar correo del comprobante", error);
    }
    res.status(201).json({ order: createdOrder });
};
exports.createOrderController = createOrderController;
const getOrdersController = async (req, res) => {
    const authReq = req;
    const { userId, role } = authReq.user;
    const where = role === "ADMIN" ? {} : { userId };
    const orders = await prisma_1.prisma.order.findMany({
        where,
        include: { items: true, payment: true, shipment: true },
        orderBy: { createdAt: "desc" }
    });
    res.json({ orders });
};
exports.getOrdersController = getOrdersController;
const getOrderController = async (req, res) => {
    const authReq = req;
    const { userId, role } = authReq.user;
    const { orderId } = req.params;
    const order = await prisma_1.prisma.order.findUnique({
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
exports.getOrderController = getOrderController;
const updateOrderStatusController = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ error: "Estado es requerido" });
    }
    const order = await prisma_1.prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: { shipment: true }
    });
    if (order.shipment) {
        await prisma_1.prisma.shipment.update({
            where: { orderId: order.id },
            data: { status: status === "SHIPPED" ? "IN_ROUTE" : status === "DELIVERED" ? "DELIVERED" : order.shipment.status }
        });
    }
    res.json({ order });
};
exports.updateOrderStatusController = updateOrderStatusController;
