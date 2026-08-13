"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect } from "react";
import { reportClientEvent } from "../lib/client-logger";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientEvent({
      level: "error",
      event: "app_error_boundary",
      message: error.message,
      stack: error.stack,
      metadata: { digest: error.digest }
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">Error</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">No se pudo cargar la pagina</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
          Intenta recargar esta vista para continuar navegando.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Reintentar
        </button>
      </main>
      <Footer />
    </div>
  );
}
