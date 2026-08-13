"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { Product } from "../types";

type ProductSearchFilterProps = {
  initialProducts: Product[];
};

const priceOptions = [
  { value: "all", label: "Todos los precios" },
  { value: "under40", label: "Hasta $40" },
  { value: "40-60", label: "$40 - $60" },
  { value: "over60", label: "Mas de $60" }
];

const sortOptions = [
  { value: "recommended", label: "Recomendado" },
  { value: "price-low", label: "Precio: Menor a mayor" },
  { value: "price-high", label: "Precio: Mayor a menor" },
  { value: "name-a", label: "Nombre: A a Z" },
  { value: "name-z", label: "Nombre: Z a A" }
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function filterProductsLocally(
  products: Product[],
  filters: {
    searchQuery: string;
    selectedCategory: string;
    selectedColor: string;
    selectedSize: string;
    selectedPrice: string;
  }
) {
  const search = normalize(filters.searchQuery.trim());

  return products.filter((product) => {
    const matchesSearch =
      !search ||
      normalize(product.name).includes(search) ||
      normalize(product.description).includes(search) ||
      product.tags.some((tag) => normalize(tag).includes(search)) ||
      normalize(product.material).includes(search);
    const matchesCategory = filters.selectedCategory === "all" || product.category.slug === filters.selectedCategory;
    const matchesColor = filters.selectedColor === "all" || product.colors.includes(filters.selectedColor);
    const matchesSize = filters.selectedSize === "all" || product.sizes.includes(filters.selectedSize);
    const matchesPrice =
      filters.selectedPrice === "all" ||
      (filters.selectedPrice === "under40" && product.price <= 40) ||
      (filters.selectedPrice === "40-60" && product.price >= 40 && product.price <= 60) ||
      (filters.selectedPrice === "over60" && product.price >= 60);

    return matchesSearch && matchesCategory && matchesColor && matchesSize && matchesPrice;
  });
}

export default function ProductSearchFilter({ initialProducts }: ProductSearchFilterProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedSort, setSelectedSort] = useState("recommended");

  const categories = useMemo(
    () => [
      { name: "Todas", slug: "all" },
      ...Array.from(new Map(initialProducts.map((product) => [product.category.slug, product.category])).values())
    ],
    [initialProducts]
  );

  const colors = useMemo(() => ["all", ...new Set(initialProducts.flatMap((product) => product.colors))], [initialProducts]);
  const sizes = useMemo(() => ["all", ...new Set(initialProducts.flatMap((product) => product.sizes))], [initialProducts]);

  useEffect(() => {
    setSelectedCategory((current) => (current === "all" || categories.some((category) => category.slug === current) ? current : "all"));
    setSelectedColor((current) => (current === "all" || colors.includes(current) ? current : "all"));
    setSelectedSize((current) => (current === "all" || sizes.includes(current) ? current : "all"));
  }, [categories, colors, sizes]);

  const filteredProducts = useMemo(
    () =>
      filterProductsLocally(initialProducts, {
        searchQuery,
        selectedCategory,
        selectedColor,
        selectedSize,
        selectedPrice
      }),
    [initialProducts, searchQuery, selectedCategory, selectedColor, selectedSize, selectedPrice]
  );

  const sortedProducts = useMemo(() => {
    const productsCopy = [...filteredProducts];

    if (selectedSort === "price-low") return productsCopy.sort((a, b) => a.price - b.price);
    if (selectedSort === "price-high") return productsCopy.sort((a, b) => b.price - a.price);
    if (selectedSort === "name-a") return productsCopy.sort((a, b) => a.name.localeCompare(b.name));
    if (selectedSort === "name-z") return productsCopy.sort((a, b) => b.name.localeCompare(a.name));
    return productsCopy;
  }, [filteredProducts, selectedSort]);

  function resetFilters() {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedColor("all");
    setSelectedSize("all");
    setSelectedPrice("all");
    setSelectedSort("recommended");
  }

  useEffect(() => {
    if (!filtersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [filtersOpen]);

  const filterContent = (
    <>
      <label className="block text-sm font-medium text-slate-700">
        Buscar
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Ej. corazones, cereza, satin"
          className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
        />
      </label>

      <div className="rounded-[1.75rem] bg-rose-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Categorias</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:block xl:space-y-2">
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setSelectedCategory(category.slug)}
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                selectedCategory === category.slug ? "bg-white text-rose-700 shadow-sm" : "bg-transparent text-slate-700 hover:bg-white hover:text-rose-700"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[1.75rem] bg-rose-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Color</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                selectedColor === color ? "border-rose-500 bg-rose-100 text-rose-700" : "border-slate-200 bg-white text-slate-700 hover:border-rose-200"
              }`}
            >
              {color === "all" ? "Todos" : color}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[1.75rem] bg-rose-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Talla</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                selectedSize === size ? "border-rose-500 bg-rose-100 text-rose-700" : "border-slate-200 bg-white text-slate-700 hover:border-rose-200"
              }`}
            >
              {size === "all" ? "Todas" : size}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[1.75rem] bg-rose-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Precio</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:block xl:space-y-2">
          {priceOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedPrice(option.value)}
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                selectedPrice === option.value ? "bg-white text-rose-700 shadow-sm" : "bg-transparent text-slate-700 hover:bg-white hover:text-rose-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={resetFilters}
        className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-rose-200 hover:text-rose-700"
      >
        Limpiar filtros
      </button>
    </>
  );

  return (
    <section className="mt-8 md:mt-10">
      <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
        <aside className="hidden rounded-[2rem] bg-white/95 p-6 shadow-[0_20px_70px_rgba(255,227,231,0.7)] ring-1 ring-white/80 xl:sticky xl:top-24 xl:block">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Filtros</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Refina tu busqueda</h2>
          </div>
          <div className="mt-6 space-y-6">{filterContent}</div>
        </aside>

        <div>
          <div className="mb-6 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm xl:hidden">
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              className="flex w-full items-center justify-between gap-4 text-left"
              aria-expanded={filtersOpen}
            >
              <span>
                <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-rose-500">Filtros</span>
                <span className="mt-1 block text-lg font-semibold text-slate-900">Buscar y refinar</span>
              </span>
              <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white">
                Abrir
              </span>
            </button>
          </div>

          {filtersOpen ? (
            <div className="fixed inset-x-0 bottom-0 top-[73px] z-40 sm:top-[77px] xl:hidden" role="dialog" aria-modal="true" aria-label="Filtros del catalogo">
              <button
                type="button"
                className="absolute inset-0 bg-slate-950/45"
                aria-label="Cerrar filtros"
                onClick={() => setFiltersOpen(false)}
              />
              <div className="absolute inset-x-0 bottom-0 flex max-h-full flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl md:inset-x-auto md:bottom-auto md:right-6 md:top-6 md:max-h-[calc(100%-3rem)] md:w-[28rem] md:rounded-[2rem]">
                <div className="shrink-0 border-b border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-500">Filtros</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-900">Refina el catalogo</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
                  >
                    Cerrar
                  </button>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                  <div className="grid gap-5">{filterContent}</div>
                </div>

                <div className="shrink-0 border-t border-slate-200 bg-white p-5">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm"
                  >
                    Ver {sortedProducts.length} resultados
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Pijamas</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Elige el conjunto perfecto</h2>
            </div>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <div className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm">
                {sortedProducts.length} resultados
              </div>
              <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <span>Ordenar</span>
                <select
                  value={selectedSort}
                  onChange={(event) => setSelectedSort(event.target.value)}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-8">
            {sortedProducts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-rose-100 bg-rose-50 p-10 text-center text-sm text-rose-700 shadow-sm">
                No se han encontrado pijamas con esos filtros. Prueba cambiar el precio o el color.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
