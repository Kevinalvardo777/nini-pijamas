import { create } from "zustand";

export type CheckoutStep = "personal" | "address" | "shipping" | "payment";
export type CheckoutShippingMethod = "pickup" | "standard" | "express";
export type CheckoutPaymentMethod = "transferencia" | "tienda" | "pasarela";

type CheckoutDraft = {
  step: CheckoutStep;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
  shippingMethod: CheckoutShippingMethod;
  paymentMethod: CheckoutPaymentMethod;
  receiptUrl: string;
  receiptName: string;
};

type CheckoutState = {
  draft: CheckoutDraft;
  ownerId: string | null;
  setOwner: (ownerId: string | null) => void;
  setDraft: (draft: Partial<CheckoutDraft>) => void;
  clearDraft: () => void;
};

const initialDraft: CheckoutDraft = {
  step: "personal",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  notes: "",
  shippingMethod: "standard",
  paymentMethod: "transferencia",
  receiptUrl: "",
  receiptName: ""
};

const storageKeyForUser = (ownerId: string) => `nini_checkout_draft_${ownerId}`;

const getStoredDraft = (ownerId: string): CheckoutDraft => {
  if (typeof window === "undefined") return initialDraft;

  try {
    const stored = window.localStorage.getItem(storageKeyForUser(ownerId));
    return stored ? { ...initialDraft, ...(JSON.parse(stored) as Partial<CheckoutDraft>) } : initialDraft;
  } catch {
    return initialDraft;
  }
};

const persistDraft = (ownerId: string | null, draft: CheckoutDraft) => {
  if (typeof window === "undefined" || !ownerId) return;
  const compactDraft = {
    ...draft,
    receiptUrl: draft.receiptUrl.startsWith("data:") ? "" : draft.receiptUrl,
    receiptName: draft.receiptUrl.startsWith("data:") ? "" : draft.receiptName
  };
  window.localStorage.setItem(storageKeyForUser(ownerId), JSON.stringify(compactDraft));
};

export const hasCheckoutProgressForUser = (ownerId: string) => {
  const draft = getStoredDraft(ownerId);
  return (
    draft.step !== "personal" ||
    Boolean(draft.firstName || draft.lastName || draft.email || draft.phone || draft.address || draft.city || draft.postalCode)
  );
};

export const clearCheckoutProgressForUser = (ownerId: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKeyForUser(ownerId));
};

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  draft: initialDraft,
  ownerId: null,
  setOwner: (ownerId) => {
    if (!ownerId) {
      set({ ownerId: null, draft: initialDraft });
      return;
    }

    set({ ownerId, draft: getStoredDraft(ownerId) });
  },
  setDraft: (draft) =>
    set((state) => {
      const nextDraft = { ...state.draft, ...draft };
      persistDraft(state.ownerId, nextDraft);
      return { draft: nextDraft };
    }),
  clearDraft: () => {
    const ownerId = get().ownerId;
    if (typeof window !== "undefined" && ownerId) {
      window.localStorage.removeItem(storageKeyForUser(ownerId));
    }
    set({ draft: initialDraft });
  }
}));
