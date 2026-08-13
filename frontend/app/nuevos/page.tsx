import Header from "../../components/Header";
import Footer from "../../components/Footer";
import PaginatedProductGrid from "../../components/PaginatedProductGrid";
import { fetchProducts } from "../../lib/api";
import { Product } from "../../types";

const sampleNewArrivals: Product[] = [
  {
    id: "new-1",
    slug: "pijama-marino-noche",
    name: "Pijama Marino Noche",
    description: "Nuevo set con detalles lunares y tela suave ideal para tus noches.",
    price: 34.9,
    oldPrice: null,
    material: "Seda ligera",
    colors: ["Azul"],
    sizes: ["S", "M", "L"],
    stock: 20,
    active: true,
    tags: ["nuevo", "tendencia"],
    category: { name: "Noche", slug: "noche" },
    images: [{ url: "/pijama4.png", alt: "Pijama marino noche" }]
  },
  {
    id: "new-2",
    slug: "pijama-verde-jardin",
    name: "Pijama Verde Jardín",
    description: "Diseño fresco con estampado botánico para sentir la naturaleza en casa.",
    price: 36.5,
    oldPrice: null,
    material: "Algodón premium",
    colors: ["Verde"],
    sizes: ["S", "M", "L"],
    stock: 14,
    active: true,
    tags: ["nuevo", "primavera"],
    category: { name: "Jardín", slug: "jardin" },
    images: [{ url: "/pijama5.png", alt: "Pijama verde jardín" }]
  },
  {
    id: "new-3",
    slug: "pijama-blanco-lunares",
    name: "Pijama Blanco Lunares",
    description: "Nuevo lanzamiento con lunares delicados para una noche elegante.",
    price: 33.9,
    oldPrice: null,
    material: "Modal suave",
    colors: ["Blanco"],
    sizes: ["S", "M", "L"],
    stock: 16,
    active: true,
    tags: ["nuevo", "navidad"],
    category: { name: "Lunares", slug: "lunare" },
    images: [{ url: "/pijama1.png", alt: "Pijama blanco lunares" }]
  },
  {
    id: "new-4",
    slug: "pijama-rosa-corazones",
    name: "Pijama Rosa Corazones",
    description: "Lanzamiento en rosa suave con estampado romántico y textura premium.",
    price: 35.0,
    oldPrice: null,
    material: "Algodón premium",
    colors: ["Rosa"],
    sizes: ["S", "M", "L"],
    stock: 18,
    active: true,
    tags: ["nuevo", "romántico"],
    category: { name: "Corazones", slug: "corazones" },
    images: [{ url: "/pijama1.png", alt: "Pijama rosa corazones" }]
  },
  {
    id: "new-5",
    slug: "pijama-rosa-encaje",
    name: "Pijama Rosa Encaje",
    description: "Nueva pijama con detalle de encaje y delicadeza femenina.",
    price: 36.2,
    oldPrice: null,
    material: "Seda ligera",
    colors: ["Rosa"],
    sizes: ["S", "M", "L"],
    stock: 12,
    active: true,
    tags: ["nuevo", "tendencia"],
    category: { name: "Encaje", slug: "encaje" },
    images: [{ url: "/pijama2.png", alt: "Pijama rosa encaje" }]
  },
  {
    id: "new-6",
    slug: "pijama-cereza-dulce",
    name: "Pijama Cereza Dulce",
    description: "Nuevo diseño dulce con estampado de cerezas para la estación.",
    price: 34.0,
    oldPrice: null,
    material: "Algodón suave",
    colors: ["Blanco", "Rojo"],
    sizes: ["S", "M", "L"],
    stock: 11,
    active: true,
    tags: ["nuevo", "verano"],
    category: { name: "Cereza", slug: "cereza" },
    images: [{ url: "/pijama3.png", alt: "Pijama cereza dulce" }]
  }
];

const seasonCards = [
  { title: "Tendencias", description: "Nuevos cortes y estampados que marcan la temporada.", accent: "text-rose-500" },
  { title: "Verano", description: "Pijamas ligeras y frescas para noches cálidas.", accent: "text-amber-500" },
  { title: "Invierno", description: "Texturas abrigadas para sentir calor y confort.", accent: "text-sky-500" },
  { title: "Navidad", description: "Series festivas con detalles rojos y dorados.", accent: "text-emerald-500" }
];

export default async function NuevosPage() {
  const products = (await fetchProducts("?sort=new")) ?? sampleNewArrivals;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
        <section className="mb-12 rounded-[3rem] bg-white p-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-200">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Nuevos ingresos</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">Lo último en pijamas</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Descubre las colecciones recién lanzadas, con tendencia boutique y novedades de temporada para tu guardarropa de descanso.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {seasonCards.map((card) => (
              <div key={card.title} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <p className={`text-sm font-semibold ${card.accent}`}>{card.title}</p>
                <p className="mt-3 text-sm text-slate-600">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <PaginatedProductGrid products={products} itemsPerPage={6} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
