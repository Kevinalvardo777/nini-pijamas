import { create } from "zustand";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
  restore: () => void;
};

const STORAGE_TOKEN = "nini_auth_token";
const STORAGE_USER = "nini_auth_user";

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  setAuth: (token, user) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_TOKEN, token);
      window.localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    }
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_TOKEN);
      window.localStorage.removeItem(STORAGE_USER);
    }
    set({ token: null, user: null, isAuthenticated: false });
  },
  restore: () => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem(STORAGE_TOKEN);
    const user = window.localStorage.getItem(STORAGE_USER);
    if (token && user) {
      try {
        const parsed = JSON.parse(user) as AuthUser;
        set({ token, user: parsed, isAuthenticated: true });
      } catch {
        window.localStorage.removeItem(STORAGE_USER);
        set({ token: null, user: null, isAuthenticated: false });
      }
    }
  }
}));
