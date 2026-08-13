"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Product } from "../types";
import { getProductImageUrl } from "../lib/product-images";
import { useAuthStore } from "../store/auth";
import { useFavoritesStore } from "../store/favorites";

export default function ProductCard({ product }: { product: Product }) {
  const image = getProductImageUrl(product);
  const tags = product.tags.filter(Boolean);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const favorite = useFavoritesStore((state) => state.isFavorite(product.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  return (
    <article className="group overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      <div className="relative overflow-hidden bg-slate-100">
        <img src={image} alt={product.images[0]?.alt ?? product.name} loading="lazy" className="h-72 w-full object-cover transition duration-500 group-hover:scale-105" />
        <button
          type="button"
          onClick={() => {
            if (!isAuthenticated) {
              window.location.href = "/login";
              return;
            }
            toggleFavorite(product.id);
          }}
          className={`absolute bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition ${
            favorite ? "border-rose-200 bg-rose-600 text-white" : "border-white/70 bg-white/90 text-slate-700 hover:text-rose-600"
          }`}
          aria-label={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart size={18} fill={favorite ? "currentColor" : "none"} />
        </button>
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-700 shadow-sm backdrop-blur-sm">
          {product.category.name}
        </div>
        {tags.length > 0 ? (
          <div className="absolute right-4 top-4 flex flex-col gap-2">
            {tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full bg-slate-950/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-sm backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="space-y-4 p-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{product.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{product.description.slice(0, 90)}...</p>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-semibold text-slate-900">${product.price.toFixed(2)}</p>
            {product.oldPrice ? <p className="text-xs text-slate-400 line-through">${product.oldPrice.toFixed(2)}</p> : null}
          </div>
          <Link href={`/product/${product.slug}`} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  );
}
