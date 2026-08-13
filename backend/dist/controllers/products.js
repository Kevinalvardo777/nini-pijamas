"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductController = exports.updateProductController = exports.createProductController = exports.getProductController = exports.listProductsController = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
const productFilterSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    size: zod_1.z.string().optional(),
    color: zod_1.z.string().optional(),
    material: zod_1.z.string().optional(),
    minPrice: zod_1.z.coerce.number().optional(),
    maxPrice: zod_1.z.coerce.number().optional(),
    available: zod_1.z.coerce.boolean().optional(),
    offers: zod_1.z.coerce.boolean().optional(),
    featured: zod_1.z.coerce.boolean().optional(),
    season: zod_1.z.string().optional(),
    sort: zod_1.z.string().optional()
});
const productCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    price: zod_1.z.coerce.number().positive(),
    oldPrice: zod_1.z.coerce.number().optional(),
    category: zod_1.z.string().optional(),
    material: zod_1.z.string().optional(),
    colors: zod_1.z.array(zod_1.z.string()).optional(),
    sizes: zod_1.z.array(zod_1.z.string()).nonempty(),
    stock: zod_1.z.coerce.number().int().nonnegative().optional(),
    active: zod_1.z.boolean().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    images: zod_1.z.array(zod_1.z.object({ url: zod_1.z.string().min(1), alt: zod_1.z.string().min(3), isPrimary: zod_1.z.boolean().optional(), position: zod_1.z.number().optional() })).optional()
});
const productInclude = {
    images: { orderBy: [{ isPrimary: "desc" }, { position: "asc" }] },
    category: true
};
const MAX_LIST_IMAGE_URL_LENGTH = 2048;
const listFallbackImages = [
    "/pijama1.png",
    "/pijama2.png",
    "/pijama3.png",
    "/pijama4.png",
    "/pijama5.png",
    "/pijama-pinterest1.png",
    "/pijama-pinterest2.png",
    "/pijama-pinterest3.png"
];
const fallbackImageForProduct = (product, imageIndex = 0, productIndex = 0) => {
    const hasStableProductKey = Boolean(product.slug ?? product.id ?? product.name);
    const baseIndex = hasStableProductKey ? productIndex : 0;
    return listFallbackImages[(baseIndex + imageIndex) % listFallbackImages.length];
};
const mapListImages = (product, productIndex) => product.images.map((image, index) => ({
    ...image,
    url: typeof image.url === "string" && image.url.length <= MAX_LIST_IMAGE_URL_LENGTH
        ? image.url
        : fallbackImageForProduct(product, index, productIndex)
}));
const normalizeImages = (images) => {
    const safeImages = images ?? [];
    const primaryIndex = Math.max(0, safeImages.findIndex((image) => image.isPrimary));
    return safeImages.map((image, index) => ({
        url: image.url,
        alt: image.alt,
        isPrimary: index === primaryIndex,
        position: index
    }));
};
const listProductsController = async (req, res) => {
    const filters = productFilterSchema.parse(req.query);
    const where = { active: true };
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
    const orderBy = [];
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
    const products = await prisma_1.prisma.product.findMany({
        where,
        orderBy,
        include: productInclude
    });
    const mapped = products.map((p, productIndex) => ({
        ...p,
        colors: typeof p.colors === "string" ? JSON.parse(p.colors) : p.colors,
        sizes: typeof p.sizes === "string" ? JSON.parse(p.sizes) : p.sizes,
        tags: typeof p.tags === "string" ? JSON.parse(p.tags) : p.tags,
        images: mapListImages(p, productIndex)
    }));
    res.json({ products: mapped });
};
exports.listProductsController = listProductsController;
const getProductController = async (req, res) => {
    const { slug } = req.params;
    const product = await prisma_1.prisma.product.findUnique({
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
exports.getProductController = getProductController;
const createProductController = async (req, res) => {
    const validation = productCreateSchema.safeParse(req.body);
    if (!validation.success) {
        const error = validation.error.errors.map((issue) => issue.message).join(". ");
        return res.status(400).json({ error: error || "Datos invalidos" });
    }
    const parsed = validation.data;
    const categoryName = parsed.category?.trim() || "Boutique";
    const category = await prisma_1.prisma.category.upsert({
        where: { slug: categoryName.toLowerCase().replace(/\s+/g, "-") },
        update: {},
        create: {
            name: categoryName,
            slug: categoryName.toLowerCase().replace(/\s+/g, "-")
        }
    });
    const slug = parsed.name.toLowerCase().replace(/\s+/g, "-");
    const product = await prisma_1.prisma.product.create({
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
exports.createProductController = createProductController;
const updateProductController = async (req, res) => {
    const { slug } = req.params;
    const product = await prisma_1.prisma.product.findUnique({ where: { slug } });
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
        const category = await prisma_1.prisma.category.upsert({
            where: { slug: parsed.category.toLowerCase().replace(/\s+/g, "-") },
            update: {},
            create: {
                name: parsed.category,
                slug: parsed.category.toLowerCase().replace(/\s+/g, "-")
            }
        });
        categoryId = category.id;
    }
    const updated = await prisma_1.prisma.product.update({
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
exports.updateProductController = updateProductController;
const deleteProductController = async (req, res) => {
    const { slug } = req.params;
    const product = await prisma_1.prisma.product.findUnique({ where: { slug } });
    if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }
    await prisma_1.prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma_1.prisma.cartItem.deleteMany({ where: { productId: product.id } });
    const orderItems = await prisma_1.prisma.orderItem.count({ where: { productId: product.id } });
    if (orderItems > 0) {
        await prisma_1.prisma.product.update({ where: { slug }, data: { active: false } });
        return res.json({ message: "Producto ocultado porque tiene pedidos asociados" });
    }
    await prisma_1.prisma.product.delete({ where: { slug } });
    res.json({ message: "Producto eliminado" });
};
exports.deleteProductController = deleteProductController;
