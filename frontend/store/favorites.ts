import { create } from "zustand";

type FavoritesState = {
  productIds: string[];
  ownerId: string | null;
  setOwner: (ownerId: string | null) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
};

const storageKeyForUser = (ownerId: string) => `nini_favorite_products_${ownerId}`;

const getStoredFavorites = (ownerId: string) => {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(storageKeyForUser(ownerId));
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
};

const persistFavorites = (ownerId: string | null, productIds: string[]) => {
  if (typeof window === "undefined" || !ownerId) return;
  window.localStorage.setItem(storageKeyForUser(ownerId), JSON.stringify(productIds));
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  productIds: [],
  ownerId: null,
  setOwner: (ownerId) => {
    if (!ownerId) {
      set({ ownerId: null, productIds: [] });
      return;
    }

    set({ ownerId, productIds: getStoredFavorites(ownerId) });
  },
  toggleFavorite: (productId) =>
    set((state) => {
      if (!state.ownerId) return state;
      const productIds = state.productIds.includes(productId)
        ? state.productIds.filter((id) => id !== productId)
        : [...state.productIds, productId];
      persistFavorites(state.ownerId, productIds);
      return { productIds };
    }),
  isFavorite: (productId) => get().productIds.includes(productId)
}));
