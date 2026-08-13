import { Product } from "../types";

export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function fetchProducts(query = ""): Promise<Product[] | null> {
  try {
    const response = await fetch(`${apiUrl}/products${query}`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.products ?? [];
  } catch (error) {
    console.error("fetchProducts error:", error);
    return null;
  }
}

export async function fetchProductBySlug(slug: string) {
  try {
    const response = await fetch(`${apiUrl}/products/${slug}`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error("fetchProductBySlug error:", error);
    return null;
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return { error: data?.error ?? `HTTP ${response.status}` };
    }

    return data;
  } catch (error) {
    console.error("loginUser error:", error);
    return null;
  }
}

export async function createOrder(orderData: Record<string, any>, token: string | null) {
  try {
    const response = await fetch(`${apiUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorResponse = await response.json().catch(() => null);
      return { order: null, error: errorResponse?.error ?? "Error al crear el pedido" };
    }

    const data = await response.json();
    return { order: data.order, error: null };
  } catch (error) {
    console.error("createOrder error:", error);
    return { order: null, error: "No se pudo conectar con el servidor." };
  }
}

export async function fetchMyOrders(token: string | null) {
  if (!token) {
    return { orders: [], error: "No autenticado" };
  }

  try {
    const response = await fetch(`${apiUrl}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return { orders: [], error: data?.error ?? "Error al cargar pedidos" };
    }

    return { orders: data.orders ?? [], error: null };
  } catch (error) {
    console.error("fetchMyOrders error:", error);
    return { orders: [], error: "No se pudo conectar con el servidor." };
  }
}
