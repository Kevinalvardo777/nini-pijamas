import { Product } from "../types";

const productImageMap: Record<string, string> = {
  "pijama-corazones-rosa": "/pijama1.png",
  "pijama-cereza-dulce": "/pijama2.png",
  "pijama-rosas-delicadas": "/pijama3.png",
  "pijama-lila-encaje": "/pijama4.png",
  "pijama-rosada-feminina": "/pijama5.png"
};

export function getProductImageUrl(product: Product) {
  const url = product.images?.find((image) => image.isPrimary)?.url ?? product.images?.[0]?.url;
  if (url && url !== "/logo.svg") {
    return url;
  }

  if (product.slug && productImageMap[product.slug]) {
    return productImageMap[product.slug];
  }

  return "/pijama1.png";
}
