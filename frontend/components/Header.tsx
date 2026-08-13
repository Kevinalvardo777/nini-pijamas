"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, Menu, Shield, X } from "lucide-react";
import { useCartStore } from "../store/cart";
import { useAuthStore } from "../store/auth";
import { useFavoritesStore } from "../store/favorites";
import { hasCheckoutProgressForUser, useCheckoutStore } from "../store/checkout";

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemCount = useCartStore((state) => state.itemCount());
  const setCartOwner = useCartStore((state) => state.setOwner);
  const setFavoritesOwner = useFavoritesStore((state) => state.setOwner);
  const setCheckoutOwner = useCheckoutStore((state) => state.setOwner);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const restoreAuth = useAuthStore((state) => state.restore);

  useEffect(() => {
    restoreAuth();
  }, [restoreAuth]);

  useEffect(() => {
    const ownerId = user?.id ?? null;
    setCartOwner(ownerId);
    setFavoritesOwner(ownerId);
    setCheckoutOwner(ownerId);
  }, [setCartOwner, setCheckoutOwner, setFavoritesOwner, user?.id]);

  const cartHref =
    user?.role === "CUSTOMER" && itemCount > 0 && hasCheckoutProgressForUser(user.id)
      ? "/checkout"
      : "/carrito";

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push("/catalogo");
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const accountLabel = user ? user.name.split(" ")[0] : "Mi cuenta";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" onClick={closeMobileMenu} className="flex min-w-0 items-center gap-3 text-slate-900" aria-label="Ir al inicio de Nini Pijamas">
          <img src="/nini-pijamas-logo.png" alt="Logo de Nini Pijamas" className="h-11 w-11 shrink-0 object-contain sm:h-12 sm:w-12 lg:h-16 lg:w-16" />
          <div className="min-w-0">
            <p className="truncate text-[11px] uppercase tracking-[0.18em] text-slate-500 sm:text-xs lg:text-sm lg:tracking-[0.28em]">NINI PIJAMAS</p>
            <p className="truncate text-xs font-semibold text-slate-900 sm:text-sm">Boutique nocturna</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex xl:gap-8" aria-label="Navegacion principal">
          <Link href="/catalogo" className="text-sm font-medium text-slate-700 hover:text-slate-900">Catalogo</Link>
          <Link href="/#quienes-somos" className="text-sm font-medium text-slate-700 hover:text-slate-900">Quienes somos</Link>
          <Link href="/ofertas" className="text-sm font-medium text-slate-700 hover:text-slate-900">Ofertas</Link>
          <Link href="/nuevos" className="text-sm font-medium text-slate-700 hover:text-slate-900">Nuevos</Link>
          <Link href="/contacto" className="text-sm font-medium text-slate-700 hover:text-slate-900">Contacto</Link>
          {user?.role === "ADMIN" ? (
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              <Shield size={15} />
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link href={cartHref} className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300" aria-label="Carrito de compras">
            <ShoppingCart size={18} />
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-slate-900 px-1.5 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>

          {user?.role === "ADMIN" ? (
            <Link href="/admin" className="hidden items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 sm:inline-flex lg:hidden">
              <Shield size={16} />
              Gestion
            </Link>
          ) : null}

          {isAuthenticated ? (
            <>
              <Link href="/mi-cuenta" className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 sm:inline-flex">
                <User size={16} />
                {user ? user.name.split(" ")[0] : "Mi cuenta"}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:inline-flex"
              >
                Salir
              </button>
            </>
          ) : (
            <Link href="/login" className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:inline-flex">
              <User size={16} /> Cuenta
            </Link>
          )}

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Cerrar menu de navegacion" : "Abrir menu de navegacion"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-full border border-slate-200 bg-white p-3 text-slate-600 shadow-sm hover:border-slate-300 hover:text-slate-900 lg:hidden"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2" aria-label="Menu movil">
            {[
              { href: "/catalogo", label: "Catalogo" },
              { href: "/#quienes-somos", label: "Quienes somos" },
              { href: "/ofertas", label: "Ofertas" },
              { href: "/nuevos", label: "Nuevos" },
              { href: "/contacto", label: "Contacto" }
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3">
              {user?.role === "ADMIN" ? (
                <Link href="/admin" onClick={closeMobileMenu} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                  <Shield size={16} />
                  Gestion admin
                </Link>
              ) : null}

              {isAuthenticated ? (
                <>
                  <Link href="/mi-cuenta" onClick={closeMobileMenu} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    <User size={16} />
                    {accountLabel}
                  </Link>
                  <button type="button" onClick={handleLogout} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Salir
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={closeMobileMenu} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  <User size={16} />
                  Cuenta
                </Link>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
