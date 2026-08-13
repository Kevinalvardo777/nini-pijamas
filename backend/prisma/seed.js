"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const passwordAdmin = await bcryptjs_1.default.hash("Admin2026!", 10);
    const passwordCliente = await bcryptjs_1.default.hash("Cliente2026!", 10);
    await prisma.user.upsert({
        where: { email: "admin@ninipijamas.ec" },
        update: {},
        create: {
            name: "Admin Nini",
            email: "admin@ninipijamas.ec",
            password: passwordAdmin,
            role: "ADMIN"
        }
    });
    await prisma.user.upsert({
        where: { email: "cliente@ninipijamas.ec" },
        update: {},
        create: {
            name: "Cliente Nini",
            email: "cliente@ninipijamas.ec",
            password: passwordCliente,
            role: "CUSTOMER"
        }
    });
    await prisma.user.upsert({
        where: { email: "cliente2@ninipijamas.ec" },
        update: {},
        create: {
            name: "Cliente Nini 2",
            email: "cliente2@ninipijamas.ec",
            password: passwordCliente,
            role: "CUSTOMER"
        }
    });
    const categories = [
        { name: "Sweet Sleep", slug: "sweet-sleep" },
        { name: "Boutique", slug: "boutique" },
        { name: "Temporada", slug: "temporada" }
    ];
    for (const category of categories) {
        await prisma.category.upsert({
            where: { slug: category.slug },
            update: {},
            create: category
        });
    }
    const products = [
        {
            name: "Pijama Corazones Rosa",
            slug: "pijama-corazones-rosa",
            description: "Pijama de algodón suave con estampado romántico, perfecto para noches boutique.",
            price: 32.9,
            oldPrice: 39.9,
            categorySlug: "sweet-sleep",
            material: "Algodón premium",
            colors: ["Rosa"],
            sizes: ["S", "M", "L"],
            stock: 20,
            active: true,
            tags: ["nuevo", "oferta"]
        },
        {
            name: "Pijama Lila Encaje",
            slug: "pijama-lila-encaje",
            description: "Set elegante con detalles de encaje para un look femenino y cómodo.",
            price: 38.9,
            oldPrice: null,
            categorySlug: "boutique",
            material: "Seda ligera",
            colors: ["Lila"],
            sizes: ["S", "M", "L"],
            stock: 15,
            active: true,
            tags: ["destacado"]
        }
    ];
    for (const product of products) {
        const category = await prisma.category.findUnique({ where: { slug: product.categorySlug } });
        if (!category)
            continue;
        await prisma.product.upsert({
            where: { slug: product.slug },
            update: {
                price: product.price,
                oldPrice: product.oldPrice,
                stock: product.stock,
                tags: JSON.stringify(product.tags),
                active: product.active,
                material: product.material,
                colors: JSON.stringify(product.colors),
                sizes: JSON.stringify(product.sizes),
                description: product.description
            },
            create: {
                name: product.name,
                slug: product.slug,
                description: product.description,
                price: product.price,
                oldPrice: product.oldPrice,
                categoryId: category.id,
                material: product.material,
                colors: JSON.stringify(product.colors),
                sizes: JSON.stringify(product.sizes),
                stock: product.stock,
                active: product.active,
                tags: JSON.stringify(product.tags),
                images: {
                    create: [
                        { url: "/product-1.svg", alt: "Foto de pijama" },
                        { url: "/product-2.svg", alt: "Foto de pijama" }
                    ]
                }
            }
        });
    }
}
main()
    .then(() => {
    console.log("Seed completado");
    process.exit(0);
})
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
