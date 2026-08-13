import type { MetadataRoute } from "next";
import { apiUrl } from "../lib/api";
import { Product } from "../types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const staticRoutes = ["", "/catalogo", "/ofertas", "/nuevos", "/contacto"];

async function getProductRoutes() {
  try {
    const response = await fetch(`${apiUrl}/products?sort=new`, { cache: "no-store" });
    if (!response.ok) return [];
    const data = (await response.json()) as { products?: Product[] };
    return (data.products ?? []).map((product) => `/product/${product.slug}`);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productRoutes = await getProductRoutes();
  const now = new Date();

  return [...staticRoutes, ...productRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route.startsWith("/product") ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/product") ? 0.8 : 0.7
  }));
}
