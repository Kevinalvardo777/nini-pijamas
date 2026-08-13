import { Product } from "../types";

const productImageMap: Record<string, string> = {
  "pijama-corazones-rosa": "/pijama1.png",
  "pijama-cereza-dulce": "/pijama2.png",
  "pijama-rosas-delicadas": "/pijama3.png",
  "pijama-lila-encaje": "/pijama4.png",
  "pijama-rosada-feminina": "/pijama5.png"
};

const fallbackImages = [
  "/pijama1.png",
  "/pijama2.png",
  "/pijama3.png",
  "/pijama4.png",
  "/pijama5.png",
  "/pijama-pinterest1.png",
  "/pijama-pinterest2.png",
  "/pijama-pinterest3.png"
];

function fallbackImageForSlug(slug: string) {
  const hash = [...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return fallbackImages[hash % fallbackImages.length];
}

export function getProductImageUrl(product: Product) {
  const url = product.images?.find((image) => image.isPrimary)?.url ?? product.images?.[0]?.url;
  if (url && url !== "/logo.svg") {
    return url;
  }

  if (product.slug && productImageMap[product.slug]) {
    return productImageMap[product.slug];
  }

  return fallbackImageForSlug(product.slug ?? product.id ?? product.name);
}
