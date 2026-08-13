"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminProductsController = exports.updateAdminUserController = exports.getAdminUsersController = exports.getAdminOrdersController = exports.getAdminReportController = exports.getAdminStatsController = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
const rolePermissions = {
    ADMIN: [
        "Ver dashboard",
        "Gestionar usuarios",
        "Gestionar roles",
        "Editar productos",
        "Editar precios",
        "Ver reportes",
        "Gestionar pedidos"
    ],
    CUSTOMER: ["Comprar productos", "Ver sus pedidos", "Gestionar carrito"]
};
const allPermissions = Array.from(new Set(Object.values(rolePermissions).flat()));
const userUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    email: zod_1.z.string().email().optional(),
    role: zod_1.z.enum(["ADMIN", "CUSTOMER"]).optional(),
    permissions: zod_1.z.array(zod_1.z.string()).optional()
});
const parseList = (value) => {
    if (Array.isArray(value))
        return value;
    if (!value)
        return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
};
const mapProduct = (product) => ({
    ...product,
    colors: parseList(product.colors),
    sizes: parseList(product.sizes),
    tags: parseList(product.tags)
});
const getUserPermissions = (role, permissions) => {
    const customPermissions = parseList(permissions);
    return customPermissions.length > 0 ? customPermissions : rolePermissions[role] ?? [];
};
const getAdminStatsController = async (_req, res) => {
    const totalSalesResult = await prisma_1.prisma.order.aggregate({
        _sum: { total: true }
    });
    const totalSales = totalSalesResult._sum.total ?? 0;
    const ordersCount = await prisma_1.prisma.order.count();
    const usersCount = await prisma_1.prisma.user.count();
    const productsCount = await prisma_1.prisma.product.count();
    const activeProducts = await prisma_1.prisma.product.count({ where: { active: true } });
    const lowStockProducts = await prisma_1.prisma.product.count({ where: { stock: { lte: 5 } } });
    const averageTicket = ordersCount > 0 ? Number(totalSales / ordersCount).toFixed(2) : "0.00";
    const productsBySales = await prisma_1.prisma.orderItem.groupBy({
        by: ["productId", "name"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5
    });
    const orders = await prisma_1.prisma.order.findMany({
        include: { items: { include: { product: { include: { category: true } } } } },
        orderBy: { createdAt: "desc" }
    });
    const salesByDay = orders.reduce((acc, order) => {
        const day = order.createdAt.toISOString().slice(0, 10);
        acc[day] = (acc[day] ?? 0) + order.total;
        return acc;
    }, {});
    const salesByCategory = orders.reduce((acc, order) => {
        order.items.forEach((item) => {
            const category = item.product.category.name ?? "Sin categoría";
            acc[category] = (acc[category] ?? 0) + item.price * item.quantity;
        });
        return acc;
    }, {});
    const pendingOrders = await prisma_1.prisma.order.count({ where: { status: "PENDING" } });
    const paidOrders = await prisma_1.prisma.order.count({ where: { status: "PAID" } });
    const confirmedOrders = await prisma_1.prisma.order.count({ where: { status: "CONFIRMED" } });
    const shippedOrders = await prisma_1.prisma.order.count({ where: { status: "SHIPPED" } });
    const deliveredOrders = await prisma_1.prisma.order.count({ where: { status: "DELIVERED" } });
    const canceledOrders = await prisma_1.prisma.order.count({ where: { status: "CANCELED" } });
    res.json({
        totalSales,
        ordersCount,
        usersCount,
        productsCount,
        activeProducts,
        lowStockProducts,
        averageTicket,
        productsBySales,
        salesByDay,
        salesByCategory,
        pendingOrders,
        paidOrders,
        confirmedOrders,
        shippedOrders,
        deliveredOrders,
        canceledOrders
    });
};
exports.getAdminStatsController = getAdminStatsController;
const getAdminReportController = async (_req, res) => {
    const orders = await prisma_1.prisma.order.findMany({
        include: { items: { include: { product: { include: { category: true } } } }, payment: true, shipment: true, user: true },
        orderBy: { createdAt: "desc" }
    });
    res.json({ orders });
};
exports.getAdminReportController = getAdminReportController;
const getAdminOrdersController = async (_req, res) => {
    const orders = await prisma_1.prisma.order.findMany({
        include: { items: { include: { product: { include: { category: true } } } }, payment: true, shipment: true, user: true },
        orderBy: { createdAt: "desc" }
    });
    res.json({ orders });
};
exports.getAdminOrdersController = getAdminOrdersController;
const getAdminUsersController = async (_req, res) => {
    const users = await prisma_1.prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            permissions: true,
            createdAt: true,
            updatedAt: true,
            _count: { select: { orders: true } }
        },
        orderBy: { createdAt: "desc" }
    });
    res.json({
        users: users.map((user) => ({
            ...user,
            permissions: getUserPermissions(user.role, user.permissions)
        })),
        roles: Object.entries(rolePermissions).map(([role, permissions]) => ({ role, permissions })),
        permissions: allPermissions
    });
};
exports.getAdminUsersController = getAdminUsersController;
const updateAdminUserController = async (req, res) => {
    const { userId } = req.params;
    const parsed = userUpdateSchema.parse(req.body);
    const user = await prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            name: parsed.name,
            email: parsed.email,
            role: parsed.role,
            permissions: parsed.permissions ? JSON.stringify(parsed.permissions) : undefined
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            permissions: true,
            createdAt: true,
            updatedAt: true,
            _count: { select: { orders: true } }
        }
    });
    res.json({
        user: {
            ...user,
            permissions: getUserPermissions(user.role, user.permissions)
        }
    });
};
exports.updateAdminUserController = updateAdminUserController;
const getAdminProductsController = async (_req, res) => {
    const products = await prisma_1.prisma.product.findMany({
        include: { images: { orderBy: [{ isPrimary: "desc" }, { position: "asc" }] }, category: true },
        orderBy: { updatedAt: "desc" }
    });
    res.json({ products: products.map(mapProduct) });
};
exports.getAdminProductsController = getAdminProductsController;
