import { Product } from "../types";
import { getClientRequestId } from "./request-id";

export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function fetchWithTimeout(input: string, init: RequestInit = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = new Headers(init.headers);
    headers.set("X-Request-Id", getClientRequestId());
    return await fetch(input, { ...init, headers, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWithRetry(input: string, init: RequestInit = {}, attempts = 2) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchWithTimeout(input, init);
      if (response.status < 500 || attempt === attempts) return response;
    } catch (error) {
      lastError = error;
      if (attempt === attempts) throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
  }

  throw lastError;
}

export async function fetchProducts(query = ""): Promise<Product[] | null> {
  try {
    const response = await fetchWithRetry(`${apiUrl}/products${query}`, { cache: "no-store" });
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
    const response = await fetchWithRetry(`${apiUrl}/products/${slug}`, { cache: "no-store" });
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
    const response = await fetchWithTimeout(`${apiUrl}/auth/login`, {
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
    const response = await fetchWithTimeout(`${apiUrl}/orders`, {
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
    const response = await fetchWithRetry(`${apiUrl}/orders`, {
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
