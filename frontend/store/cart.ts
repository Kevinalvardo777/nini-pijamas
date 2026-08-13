import { create } from "zustand";
import { CartItem } from "../types";

type CartState = {
  items: CartItem[];
  ownerId: string | null;
  setOwner: (ownerId: string | null) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  total: () => number;
};

const LEGACY_STORAGE_KEY = "nini_cart_items";
const AUTH_USER_STORAGE_KEY = "nini_auth_user";
const storageKeyForUser = (ownerId: string) => `nini_cart_items_${ownerId}`;

const getStoredItems = (ownerId: string): CartItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(storageKeyForUser(ownerId));
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const compactCartItem = (item: CartItem): CartItem => ({
  ...item,
  image: item.image.startsWith("data:") ? "" : item.image
});

const compactCartItems = (items: CartItem[]) => items.map(compactCartItem);

const repairStoredCart = (ownerId: string) => {
  if (typeof window === "undefined") return;
  const compactItems = compactCartItems(getStoredItems(ownerId));
  try {
    window.localStorage.setItem(storageKeyForUser(ownerId), JSON.stringify(compactItems));
  } catch {
    window.localStorage.removeItem(storageKeyForUser(ownerId));
  }
};

export const getStoredCartCountForUser = (ownerId: string) =>
  getStoredItems(ownerId).reduce((sum, item) => sum + item.quantity, 0);

const getCurrentAuthUserId = () => {
  if (typeof window === "undefined") return null;

  try {
    const storedUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!storedUser) return null;
    const parsed = JSON.parse(storedUser) as { id?: string };
    return parsed.id ?? null;
  } catch {
    return null;
  }
};

const persistItems = (ownerId: string | null, items: CartItem[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  if (!ownerId) return;
  const compactItems = compactCartItems(items);

  try {
    window.localStorage.setItem(storageKeyForUser(ownerId), JSON.stringify(compactItems));
  } catch (error) {
    console.warn("No se pudo persistir el carrito completo. Se guardara una version compacta.", error);
    window.localStorage.setItem(
      storageKeyForUser(ownerId),
      JSON.stringify(compactItems.map((item) => ({ ...item, image: "" })))
    );
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  ownerId: null,
  setOwner: (ownerId) => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }

    if (!ownerId) {
      if (get().ownerId !== null) {
        set({ ownerId: null, items: [] });
      }
      return;
    }

    repairStoredCart(ownerId);
    set({ ownerId, items: compactCartItems(getStoredItems(ownerId)) });
  },
  addItem: (item) =>
    set((state) => {
      const ownerId = state.ownerId ?? getCurrentAuthUserId();
      const baseItems = compactCartItems(ownerId && ownerId !== state.ownerId ? getStoredItems(ownerId) : state.items);
      const compactItem = compactCartItem(item);
      const existingIndex = baseItems.findIndex((current) => current.id === compactItem.id);
      const items = [...baseItems];
      if (existingIndex >= 0) {
        items[existingIndex] = {
          ...items[existingIndex],
          quantity: items[existingIndex].quantity + compactItem.quantity
        };
      } else {
        items.push(compactItem);
      }
      persistItems(ownerId, items);
      return { ownerId, items };
    }),
  removeItem: (id) =>
    set((state) => {
      const items = state.items.filter((item) => item.id !== id);
      const ownerId = state.ownerId ?? getCurrentAuthUserId();
      persistItems(ownerId, items);
      return { items };
    }),
  updateItemQuantity: (id, quantity) =>
    set((state) => {
      const items = state.items.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item));
      const ownerId = state.ownerId ?? getCurrentAuthUserId();
      persistItems(ownerId, items);
      return { items };
    }),
  clearCart: () => {
    persistItems(get().ownerId ?? getCurrentAuthUserId(), []);
    return { items: [] };
  },
  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}));
