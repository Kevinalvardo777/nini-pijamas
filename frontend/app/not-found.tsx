import Header from "../components/Header";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">Pagina no encontrada</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
          La pagina que buscas no esta disponible o cambio de direccion.
        </p>
        <a
          href="/catalogo"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Ver catalogo
        </a>
      </main>
      <Footer />
    </div>
  );
}
