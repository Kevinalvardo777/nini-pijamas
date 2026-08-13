"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, PackageCheck, ShoppingBag, UserRound } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import ProductCard from "../../components/ProductCard";
import { fetchMyOrders, fetchProducts } from "../../lib/api";
import { useAuthStore } from "../../store/auth";
import { useFavoritesStore } from "../../store/favorites";
import { Product } from "../../types";

type AccountOrderItem = {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
};

type AccountOrder = {
  id: string;
  number: string;
  status: string;
  total: number;
  createdAt: string;
  items: AccountOrderItem[];
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  CONFIRMED: "Confirmado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELED: "Cancelado"
};

export default function AccountPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const restoreAuth = useAuthStore((state) => state.restore);
  const favoriteIds = useFavoritesStore((state) => state.productIds);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreAuth();
  }, [restoreAuth]);

  useEffect(() => {
    let active = true;

    const loadAccountData = async () => {
      if (!isAuthenticated) {
        setProducts([]);
        setOrders([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const [productsData, ordersData] = await Promise.all([fetchProducts("?sort=new"), fetchMyOrders(token)]);
      if (!active) return;
      setProducts(productsData ?? []);
      setOrders(ordersData.orders as AccountOrder[]);
      setLoading(false);
    };

    void loadAccountData();

    return () => {
      active = false;
    };
  }, [isAuthenticated, token]);

  const favoriteProducts = useMemo(
    () => products.filter((product) => favoriteIds.includes(product.id)),
    [favoriteIds, products]
  );

  const purchasedProducts = useMemo(() => {
    const purchased = new Map<string, { product?: Product; item: AccountOrderItem; quantity: number }>();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const current = purchased.get(item.productId);
        purchased.set(item.productId, {
          product: products.find((product) => product.id === item.productId),
          item,
          quantity: (current?.quantity ?? 0) + item.quantity
        });
      });
    });

    return Array.from(purchased.values());
  }, [orders, products]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="border-b border-slate-200 pb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Mi cuenta</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            {isAuthenticated ? `Hola, ${user?.name}` : "Bienvenida"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600">
            {isAuthenticated
              ? "Revisa tus favoritos, productos comprados y estado de pedidos."
              : "Puedes comprar como invitado. Inicia sesion para guardar favoritos y ver historial."}
          </p>
        </section>

        {!isAuthenticated ? (
          <section className="mt-8 rounded-2xl border border-rose-100 bg-white p-8 text-center shadow-sm">
            <UserRound className="mx-auto h-10 w-10 text-rose-500" />
            <h2 className="mt-4 text-xl font-semibold text-slate-950">Tu cuenta de cliente</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">Inicia sesion para ver favoritos, pedidos y productos comprados.</p>
            <Link href="/login" className="mt-6 inline-flex rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-700">
              Iniciar sesion
            </Link>
          </section>
        ) : (
          <>
            <section className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Heart className="h-5 w-5 text-rose-500" />
                <p className="mt-3 text-2xl font-semibold text-slate-950">{favoriteProducts.length}</p>
                <p className="text-sm text-slate-500">Favoritos</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <ShoppingBag className="h-5 w-5 text-slate-700" />
                <p className="mt-3 text-2xl font-semibold text-slate-950">{purchasedProducts.length}</p>
                <p className="text-sm text-slate-500">Productos comprados</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <PackageCheck className="h-5 w-5 text-emerald-600" />
                <p className="mt-3 text-2xl font-semibold text-slate-950">{orders.length}</p>
                <p className="text-sm text-slate-500">Pedidos</p>
              </div>
            </section>

            <section className="mt-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Favoritos</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">Productos guardados</h2>
                </div>
                <Link href="/catalogo" className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Ver catalogo
                </Link>
              </div>

              <div className="mt-5">
                {loading ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                    <LoadingSpinner className="h-4 w-4 text-rose-600" />
                    Cargando favoritos...
                  </div>
                ) : favoriteProducts.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {favoriteProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Aun no tienes favoritos guardados.</div>
                )}
              </div>
            </section>

            <section className="mt-10">
              <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Comprados</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Productos comprados</h2>

              <div className="mt-5 grid gap-4">
                {loading ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                    <LoadingSpinner className="h-4 w-4 text-rose-600" />
                    Cargando compras...
                  </div>
                ) : purchasedProducts.length > 0 ? (
                  purchasedProducts.map(({ product, item, quantity }) => (
                    <div key={item.productId} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-4">
                        {product ? <img src={product.images[0]?.url ?? "/pijama1.png"} alt={item.name} className="h-16 w-16 rounded-xl object-cover" /> : null}
                        <div>
                          <p className="font-semibold text-slate-950">{item.name}</p>
                          <p className="text-sm text-slate-500">Comprado: {quantity} unidad(es)</p>
                          <p className="text-xs text-slate-400">Ultima variante: {item.size} / {item.color}</p>
                        </div>
                      </div>
                      {product ? (
                        <Link href={`/product/${product.slug}`} className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                          Ver
                        </Link>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Aun no tienes productos comprados con esta cuenta.</div>
                )}
              </div>
            </section>

            <section className="mt-10">
              <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Pedidos</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Historial</h2>
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {orders.length > 0 ? (
                  orders.slice(0, 8).map((order) => (
                    <div key={order.id} className="flex flex-col gap-2 border-b border-slate-100 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-950">{order.number}</p>
                        <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()} - {order.items.length} producto(s)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{statusLabels[order.status] ?? order.status}</span>
                        <span className="font-semibold text-slate-950">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-sm text-slate-500">Aun no tienes pedidos registrados con esta cuenta.</div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
