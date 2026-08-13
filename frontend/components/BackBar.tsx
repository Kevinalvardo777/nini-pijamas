"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type BackBarProps = {
  fallbackHref?: string;
  label?: string;
};

export default function BackBar({ fallbackHref = "/catalogo", label = "Volver" }: BackBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-100"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>{label}</span>
      </button>
    </div>
  );
}
