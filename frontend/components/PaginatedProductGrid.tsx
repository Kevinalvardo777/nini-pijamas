"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { Product } from "../types";

interface PaginatedProductGridProps {
  products: Product[];
  itemsPerPage?: number;
}

export default function PaginatedProductGrid({ products, itemsPerPage = 6 }: PaginatedProductGridProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));

  const visibleProducts = useMemo(
    () => products.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [page, products, itemsPerPage]
  );

  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="flex flex-col items-center justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 shadow-sm sm:flex-row">
        <p>
          Mostrando <span className="font-semibold text-slate-900">{visibleProducts.length}</span> de <span className="font-semibold text-slate-900">{products.length}</span> pijamas
        </p>
        <nav className="inline-flex items-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => changePage(page - 1)}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => changePage(pageNumber)}
                className={`min-w-[2.25rem] rounded-full px-3 py-2 text-sm font-semibold transition ${
                  pageNumber === page
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => changePage(page + 1)}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </nav>
      </div>
    </div>
  );
}
