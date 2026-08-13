export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function fetchProducts(query = "") {
  const response = await fetch(`${apiUrl}/products${query}`, { cache: "no-store" });
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data.products ?? [];
}

export async function fetchProductBySlug(slug: string) {
  const response = await fetch(`${apiUrl}/products/${slug}`, { cache: "no-store" });
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data.product;
}
