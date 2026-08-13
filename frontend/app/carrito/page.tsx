"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackBar from "../../components/BackBar";
import { useCartStore } from "../../store/cart";
import { Minus, Plus, Trash2 } from "lucide-react";
import { fetchProducts } from "../../lib/api";
import { getProductImageUrl } from "../../lib/product-images";
import { CartItem, Product } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";

function CartItemImage({ src, alt, resolving }: { src: string; alt: string; resolving: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setLoaded(false);
    setCurrentSrc(src);
  }, [src]);

  const isWaiting = resolving || (Boolean(currentSrc) && !loaded);

  return (
    <div className="relative h-28 w-full overflow-hidden rounded-3xl border border-slate-100 bg-slate-100">
      {isWaiting ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100 text-slate-400">
          <LoadingSpinner className="h-5 w-5" />
        </div>
      ) : null}
      {currentSrc ? (
        <img
          src={currentSrc}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (currentSrc !== "/pijama1.png") {
              setLoaded(false);
              setCurrentSrc("/pijama1.png");
              return;
            }
            setLoaded(true);
          }}
          className={`h-full w-full object-cover transition-opacity duration-200 ${loaded && !resolving ? "opacity-100" : "opacity-0"}`}
        />
      ) : null}
    </div>
  );
}

export default function CarritoPage() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        const response = await fetchProducts("?sort=new");
        if (active) {
          setProducts(response ?? []);
        }
      } finally {
        if (active) {
          setProductsLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const productImages = useMemo(() => {
    return {
      byId: new Map(products.map((product) => [product.id, getProductImageUrl(product)])),
      bySlug: new Map(products.map((product) => [product.slug, getProductImageUrl(product)])),
      byName: new Map(products.map((product) => [product.name.trim().toLowerCase(), getProductImageUrl(product)]))
    };
  }, [products]);

  const getCartItemImage = (item: CartItem) => {
    const catalogImage =
      productImages.byId.get(item.productId) ??
      (item.slug ? productImages.bySlug.get(item.slug) : undefined) ??
      productImages.byName.get(item.name.trim().toLowerCase());

    const storedImage = item.image || undefined;
    return catalogImage ?? storedImage ?? (productsLoading ? "" : "/pijama1.png");
  };

  const isResolvingImage = (item: CartItem) => productsLoading && !item.image;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <BackBar />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white p-8 shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Carrito</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Tu carrito</h1>
            <p className="mt-3 text-sm text-slate-600">Verifica tu selección antes de continuar al checkout.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 p-8 text-center">
                  <p className="text-lg font-semibold text-slate-900">Tu carrito está vacío</p>
                  <p className="mt-3 text-sm text-slate-600">Agrega pijamas desde el catálogo para verlas aquí.</p>
                  <Link href="/catalogo" className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
                    Ir al catálogo
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                      <CartItemImage src={getCartItemImage(item)} alt={item.name} resolving={isResolvingImage(item)} />
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                            <p className="mt-1 text-sm text-slate-600">Talla: {item.size}</p>
                            <p className="text-sm text-slate-600">Color: {item.color}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-2 py-1">
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm hover:bg-slate-100"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="mx-2 min-w-[2rem] text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm hover:bg-slate-100"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-500">Precio unidad</p>
                            <p className="text-lg font-semibold text-slate-900">${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Resumen</p>
              <div className="mt-6 space-y-3 text-slate-700">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Envío</span><span>$5.90</span></div>
                <div className="flex justify-between text-sm"><span>Descuento</span><span>-$0.00</span></div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5 text-lg font-semibold text-slate-900">
                <span>Total</span>
                <span>${(total + 5.9).toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-800"
              >
                Continuar al checkout
              </Link>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
