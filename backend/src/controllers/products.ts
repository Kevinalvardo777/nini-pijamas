import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";

const productFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  available: z.coerce.boolean().optional(),
  offers: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  season: z.string().optional(),
  sort: z.string().optional()
});

const productCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().positive(),
  oldPrice: z.coerce.number().optional(),
  category: z.string().optional(),
  material: z.string().optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).nonempty(),
  stock: z.coerce.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.object({ url: z.string().min(1), alt: z.string().min(3), isPrimary: z.boolean().optional(), position: z.number().optional() })).optional()
});

const productInclude = {
  images: { orderBy: [{ isPrimary: "desc" as const }, { position: "asc" as const }] },
  category: true
};

const normalizeImages = (images: z.infer<typeof productCreateSchema>["images"]) => {
  const safeImages = images ?? [];
  const primaryIndex = Math.max(
    0,
    safeImages.findIndex((image) => image.isPrimary)
  );

  return safeImages.map((image, index) => ({
    url: image.url,
    alt: image.alt,
    isPrimary: index === primaryIndex,
    position: index
  }));
};

export const listProductsController = async (req: Request, res: Response) => {
  const filters = productFilterSchema.parse(req.query);

  const where: any = { active: true };
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { description: { contains: filters.search } }
    ];
  }
  if (filters.category) {
    where.category = { slug: filters.category };
  }
  if (filters.material) {
    where.material = { contains: filters.material };
  }
  if (filters.available) {
    where.stock = { gt: 0 };
  }
  if (filters.offers) {
    where.tags = { contains: '"oferta"' };
  }
  if (filters.featured) {
    where.tags = { contains: '"destacado"' };
  }
  if (filters.season) {
    where.tags = { contains: `"${filters.season}"` };
  }
  if (filters.color) {
    where.colors = { contains: `"${filters.color}"` };
  }
  if (filters.size) {
    where.sizes = { contains: `"${filters.size}"` };
  }
  if (filters.minPrice) {
    where.price = { ...where.price, gte: filters.minPrice };
  }
  if (filters.maxPrice) {
    where.price = { ...where.price, lte: filters.maxPrice };
  }

  const orderBy: any = [];
  switch (filters.sort) {
    case "price_asc":
      orderBy.push({ price: "asc" });
      break;
    case "price_desc":
      orderBy.push({ price: "desc" });
      break;
    case "new":
      orderBy.push({ createdAt: "desc" });
      break;
    default:
      orderBy.push({ updatedAt: "desc" });
      break;
  }

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: productInclude
  });
  const mapped = products.map((p: any) => ({
    ...p,
    colors: typeof p.colors === "string" ? JSON.parse(p.colors) : p.colors,
    sizes: typeof p.sizes === "string" ? JSON.parse(p.sizes) : p.sizes,
    tags: typeof p.tags === "string" ? JSON.parse(p.tags) : p.tags
  }));

  res.json({ products: mapped });
};

export const getProductController = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: productInclude
  });
  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  const mapped = {
    ...product,
    colors: typeof product.colors === "string" ? JSON.parse(product.colors) : product.colors,
    sizes: typeof product.sizes === "string" ? JSON.parse(product.sizes) : product.sizes,
    tags: typeof product.tags === "string" ? JSON.parse(product.tags) : product.tags
  };
  res.json({ product: mapped });
};

export const createProductController = async (req: Request, res: Response) => {
  const validation = productCreateSchema.safeParse(req.body);
  if (!validation.success) {
    const error = validation.error.errors.map((issue) => issue.message).join(". ");
    return res.status(400).json({ error: error || "Datos invalidos" });
  }

  const parsed = validation.data;
  const categoryName = parsed.category?.trim() || "Boutique";
  const category = await prisma.category.upsert({
    where: { slug: categoryName.toLowerCase().replace(/\s+/g, "-") },
    update: {},
    create: {
      name: categoryName,
      slug: categoryName.toLowerCase().replace(/\s+/g, "-")
    }
  });

  const slug = parsed.name.toLowerCase().replace(/\s+/g, "-");

  const product = await prisma.product.create({
    data: {
      name: parsed.name,
      slug,
      description: parsed.description,
      price: parsed.price,
      oldPrice: parsed.oldPrice,
      categoryId: category.id,
      material: parsed.material?.trim() || "Sin especificar",
      colors: JSON.stringify(parsed.colors ?? []),
      sizes: JSON.stringify(parsed.sizes),
      stock: parsed.stock ?? 0,
      active: parsed.active ?? true,
      tags: JSON.stringify(parsed.tags ?? []),
      images: {
        create: normalizeImages(parsed.images)
      }
    },
    include: productInclude
  });

  res.status(201).json({ product });
};

export const updateProductController = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  const validation = productCreateSchema.partial().safeParse(req.body);
  if (!validation.success) {
    const error = validation.error.errors.map((issue) => issue.message).join(". ");
    return res.status(400).json({ error: error || "Datos invalidos" });
  }

  const parsed = validation.data;
  let categoryId = product.categoryId;
  if (parsed.category) {
    const category = await prisma.category.upsert({
      where: { slug: parsed.category.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        name: parsed.category,
        slug: parsed.category.toLowerCase().replace(/\s+/g, "-")
      }
    });
    categoryId = category.id;
  }

  const updated = await prisma.product.update({
    where: { slug },
    data: {
      name: parsed.name,
      description: parsed.description,
      price: parsed.price,
      oldPrice: parsed.oldPrice,
      categoryId,
      material: parsed.material,
      colors: parsed.colors ? JSON.stringify(parsed.colors) : undefined,
      sizes: parsed.sizes ? JSON.stringify(parsed.sizes) : undefined,
      stock: parsed.stock,
      active: parsed.active,
      tags: parsed.tags ? JSON.stringify(parsed.tags) : undefined,
      images: parsed.images ? { deleteMany: {}, create: normalizeImages(parsed.images) } : undefined
    },
    include: productInclude
  });

  res.json({ product: updated });
};

export const deleteProductController = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  await prisma.productImage.deleteMany({ where: { productId: product.id } });
  await prisma.cartItem.deleteMany({ where: { productId: product.id } });
  const orderItems = await prisma.orderItem.count({ where: { productId: product.id } });

  if (orderItems > 0) {
    await prisma.product.update({ where: { slug }, data: { active: false } });
    return res.json({ message: "Producto ocultado porque tiene pedidos asociados" });
  }

  await prisma.product.delete({ where: { slug } });
  res.json({ message: "Producto eliminado" });
};
