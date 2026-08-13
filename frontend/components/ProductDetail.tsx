"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, Heart, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "../store/cart";
import { useAuthStore } from "../store/auth";
import { useFavoritesStore } from "../store/favorites";
import { clearCheckoutProgressForUser, useCheckoutStore } from "../store/checkout";
import { getProductImageUrl } from "../lib/product-images";
import { Product } from "../types";

type ProductDetailProps = {
  product: Product;
};

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? "");
  const [selectedImageIndex, setSelectedImageIndex] = useState(() => {
    const primaryIndex = product.images.findIndex((image) => image.isPrimary);
    return primaryIndex >= 0 ? primaryIndex : 0;
  });
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState("");
  const addItem = useCartStore((state) => state.addItem);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const favorite = useFavoritesStore((state) => state.isFavorite(product.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const clearCheckoutDraft = useCheckoutStore((state) => state.clearDraft);
  const router = useRouter();

  const galleryImages = product.images.length > 0 ? product.images : [{ url: getProductImageUrl(product), alt: product.name }];
  const selectedGalleryImage = galleryImages[selectedImageIndex] ?? galleryImages[0];
  const image = selectedGalleryImage?.url ?? getProductImageUrl(product);

  const hasVariants = product.colors.length > 1 || product.sizes.length > 1;

  const itemPrice = useMemo(() => product.price.toFixed(2), [product.price]);

  const handleAddToCart = () => {
    if (!selectedSize) return;

    addItem({
      id: `${product.id}-${selectedColor}-${selectedSize}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      quantity,
      size: selectedSize,
      color: selectedColor,
      image
    });

    clearCheckoutDraft();
    if (user?.id) {
      clearCheckoutProgressForUser(user.id);
    }

    setAddedMessage("Anadido al carrito");
    window.setTimeout(() => setAddedMessage(""), 2200);
  };

  const handleQuantityChange = (value: number) => {
    const next = Math.max(1, quantity + value);
    setQuantity(next);
  };

  const goToImage = (direction: 1 | -1) => {
    setSelectedImageIndex((current) => {
      const next = current + direction;
      if (next < 0) return galleryImages.length - 1;
      if (next >= galleryImages.length) return 0;
      return next;
    });
  };

  const handleTouchEnd = (clientX: number) => {
    if (touchStartX === null || galleryImages.length <= 1) return;
    const delta = touchStartX - clientX;
    if (Math.abs(delta) > 40) {
      goToImage(delta > 0 ? 1 : -1);
    }
    setTouchStartX(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[2rem] bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6">
          <div
            className="relative overflow-hidden rounded-[2rem]"
            onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
            onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
          >
            <img src={image} alt={selectedGalleryImage?.alt ?? product.name} className="h-[560px] w-full object-cover" />
            {galleryImages.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => goToImage(-1)}
                  className="absolute left-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm hover:bg-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => goToImage(1)}
                  className="absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm hover:bg-white"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-4 left-1/2 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white">
                  {selectedImageIndex + 1} / {galleryImages.length}
                </div>
              </>
            ) : null}
          </div>
          {galleryImages.length > 1 ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((galleryImage, index) => (
                <button
                  key={`${galleryImage.url.slice(0, 24)}-${index}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`h-24 w-24 shrink-0 overflow-hidden rounded-xl border p-1 ${selectedImageIndex === index ? "border-slate-900" : "border-slate-200"}`}
                >
                  <img src={galleryImage.url} alt={galleryImage.alt} className="h-20 w-full rounded-lg object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold uppercase tracking-[0.2em] text-slate-700">
              {product.category.name}
            </span>
            {product.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold uppercase tracking-[0.2em] text-slate-700">
                {tag}
              </span>
            ))}
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold text-slate-900">{product.name}</h1>
            <p className="text-base leading-8 text-slate-600">{product.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Material</p>
              <p className="mt-2 text-base font-medium text-slate-900">{product.material}</p>
            </div>
            <div className="rounded-[1.75rem] bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Stock</p>
              <p className="mt-2 text-base font-medium text-slate-900">{product.stock} disponibles</p>
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Precio</p>
          <div className="mt-3 flex items-center gap-3">
            <p className="text-3xl font-semibold text-slate-900">${itemPrice}</p>
            {product.oldPrice ? <span className="text-sm line-through text-slate-500">${product.oldPrice.toFixed(2)}</span> : null}
          </div>
        </div>

        <div className="space-y-6 rounded-[2rem] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Color</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    selectedColor === color
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Talla</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    selectedSize === size
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {!selectedSize ? <p className="mt-3 text-sm text-rose-600">Selecciona una talla para continuar.</p> : null}
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Cantidad</p>
            <div className="mt-3 flex w-max items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-1 py-1">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm hover:bg-slate-100"
              >
                <Minus size={16} />
              </button>
              <span className="inline-flex h-10 min-w-[3rem] items-center justify-center rounded-full bg-white text-base font-semibold text-slate-900">{quantity}</span>
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm hover:bg-slate-100"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <ShoppingBag size={18} className="mr-2" />
            Agregar al carrito
          </button>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => router.push("/carrito")}
              className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100"
            >
              Ir al carrito
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  router.push("/login");
                  return;
                }
                toggleFavorite(product.id);
              }}
              className={`inline-flex w-full items-center justify-center rounded-full border px-6 py-4 text-sm font-semibold shadow-sm ${
                favorite ? "border-rose-600 bg-rose-600 text-white hover:bg-rose-700" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Heart size={18} className="mr-2" fill={favorite ? "currentColor" : "none"} />
              {favorite ? "Favorito" : "Favorito"}
            </button>
          </div>

          {addedMessage ? <p className="mt-2 text-sm text-rose-600">{addedMessage}</p> : null}
        </div>
      </aside>
    </div>
  );
}
