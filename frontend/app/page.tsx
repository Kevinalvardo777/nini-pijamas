import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import AboutSection from "../components/AboutSection";
import { fetchProducts } from "../lib/api";
import { Product } from "../types";

const sampleProducts: Product[] = [
  {
    id: "sample-1",
    slug: "pijama-rosa-corazones",
    name: "Pijama Corazones Rosa",
    description: "Con estampado romántico, tela suave y detalle boutique para noches especiales.",
    price: 32.99,
    oldPrice: 39.99,
    material: "Algodón premium",
    colors: ["rosa"],
    sizes: ["S", "M", "L"],
    stock: 24,
    active: true,
    tags: ["nuevo", "destacado"],
    category: { name: "Sweet Sleep", slug: "sweet-sleep" },
    images: [{ url: "/pijama1.png", alt: "Pijama rosa corazones" }]
  },
  {
    id: "sample-2",
    slug: "pijama-lila-encaje",
    name: "Pijama Lila Encaje",
    description: "Diseño elegante con suave encaje y ajuste femenino para comodidad boutique.",
    price: 38.9,
    oldPrice: null,
    material: "Seda ligera",
    colors: ["lila"],
    sizes: ["S", "M", "L"],
    stock: 18,
    active: true,
    tags: ["destacado"],
    category: { name: "Boutique", slug: "boutique" },
    images: [{ url: "/pijama2.png", alt: "Pijama lila encaje" }]
  }
];

export default async function Home() {
  const products = (await fetchProducts("?featured=true")) ?? [];
  const featured = products.length > 0 ? products.slice(0, 4) : sampleProducts;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[0.95fr_0.9fr] lg:items-center">
          <div className="rounded-[3rem] bg-white/95 p-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-200">
            <div className="max-w-xl">
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
                Colección premium
              </span>
              <h1 className="mt-8 text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
                Sueños suaves con estilo boutique
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Encuentra pijamas femeninas de alta calidad, con cortes cómodos y acabados elegantes para cada noche.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="/catalogo"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-4 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
                >
                  Ver catálogo
                </a>
                <a
                  href="/contacto"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Consulta personalizada
                </a>
              </div>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              <div className="rounded-[2rem] bg-slate-100 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Materiales</p>
                <h2 className="mt-4 text-2xl font-semibold text-slate-900">Algodón premium</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">Telas ligeras y suaves que mantienen la forma y la comodidad noche tras noche.</p>
              </div>
              <div className="rounded-[2rem] bg-slate-100 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Detalle</p>
                <h2 className="mt-4 text-2xl font-semibold text-slate-900">Acabados femeninos</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">Encajes delicados, estampados refinados y cortes ajustados pensados para un look elegante.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="group overflow-hidden rounded-[3rem] bg-slate-950 p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.14)]">
              <div className="rounded-[2rem] bg-slate-900/95 p-8 shadow-sm">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Exclusivo</p>
                <h2 className="mt-4 text-3xl font-semibold">Edición limitada</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">Prendas seleccionadas con estampados suaves y colores atemporales para el descanso más elegante.</p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.75rem] bg-slate-800 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Talla</p>
                    <p className="mt-3 text-lg font-semibold">S, M, L</p>
                  </div>
                  <div className="rounded-[1.75rem] bg-slate-800 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Colores</p>
                    <p className="mt-3 text-lg font-semibold">Tonos neutros</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                <img src="/pijama1.png" alt="Pijama rosa corazones" className="h-64 w-full rounded-[2rem] object-cover" />
              </div>
              <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                <img src="/pijama2.png" alt="Pijama lila encaje" className="h-64 w-full rounded-[2rem] object-cover" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Selección destacada</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Pijamas premium</h2>
            </div>
            <a href="/catalogo" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
              Ver todo el catálogo
            </a>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <AboutSection />
        </section>
      </main>
      <Footer />
    </div>
  );
}
