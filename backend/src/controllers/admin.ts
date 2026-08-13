import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";

const rolePermissions: Record<string, string[]> = {
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

const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "CUSTOMER"]).optional(),
  permissions: z.array(z.string()).optional()
});

const parseList = (value: string | string[] | null | undefined) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const mapProduct = (product: any) => ({
  ...product,
  colors: parseList(product.colors),
  sizes: parseList(product.sizes),
  tags: parseList(product.tags)
});

const getUserPermissions = (role: string, permissions: string) => {
  const customPermissions = parseList(permissions);
  return customPermissions.length > 0 ? customPermissions : rolePermissions[role] ?? [];
};

export const getAdminStatsController = async (_req: Request, res: Response) => {
  const totalSalesResult = await prisma.order.aggregate({
    _sum: { total: true }
  });
  const totalSales = totalSalesResult._sum.total ?? 0;
  const ordersCount = await prisma.order.count();
  const usersCount = await prisma.user.count();
  const productsCount = await prisma.product.count();
  const activeProducts = await prisma.product.count({ where: { active: true } });
  const lowStockProducts = await prisma.product.count({ where: { stock: { lte: 5 } } });
  const averageTicket = ordersCount > 0 ? Number(totalSales / ordersCount).toFixed(2) : "0.00";

  const productsBySales = await prisma.orderItem.groupBy({
    by: ["productId", "name"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5
  });

  const orders = await prisma.order.findMany({
    include: { items: { include: { product: { include: { category: true } } } } },
    orderBy: { createdAt: "desc" }
  });

  const salesByDay = orders.reduce((acc, order) => {
    const day = order.createdAt.toISOString().slice(0, 10);
    acc[day] = (acc[day] ?? 0) + order.total;
    return acc;
  }, {} as Record<string, number>);

  const salesByCategory = orders.reduce((acc, order) => {
    order.items.forEach((item) => {
      const category = item.product.category.name ?? "Sin categoría";
      acc[category] = (acc[category] ?? 0) + item.price * item.quantity;
    });
    return acc;
  }, {} as Record<string, number>);

  const pendingOrders = await prisma.order.count({ where: { status: "PENDING" } });
  const paidOrders = await prisma.order.count({ where: { status: "PAID" } });
  const confirmedOrders = await prisma.order.count({ where: { status: "CONFIRMED" } });
  const shippedOrders = await prisma.order.count({ where: { status: "SHIPPED" } });
  const deliveredOrders = await prisma.order.count({ where: { status: "DELIVERED" } });
  const canceledOrders = await prisma.order.count({ where: { status: "CANCELED" } });

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

export const getAdminReportController = async (_req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: { include: { category: true } } } }, payment: true, shipment: true, user: true },
    orderBy: { createdAt: "desc" }
  });

  res.json({ orders });
};

export const getAdminOrdersController = async (_req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: { include: { category: true } } } }, payment: true, shipment: true, user: true },
    orderBy: { createdAt: "desc" }
  });

  res.json({ orders });
};

export const getAdminUsersController = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
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

export const updateAdminUserController = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const parsed = userUpdateSchema.parse(req.body);

  const user = await prisma.user.update({
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

export const getAdminProductsController = async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    include: { images: { orderBy: [{ isPrimary: "desc" }, { position: "asc" }] }, category: true },
    orderBy: { updatedAt: "desc" }
  });

  res.json({ products: products.map(mapProduct) });
};
