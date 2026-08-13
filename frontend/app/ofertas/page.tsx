import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackBar from "../../components/BackBar";
import PaginatedProductGrid from "../../components/PaginatedProductGrid";
import { fetchProducts } from "../../lib/api";
import { Product } from "../../types";

const sampleOffers: Product[] = [
  {
    id: "offer-1",
    slug: "pijama-roja-flores",
    name: "Pijama Roja Flores",
    description: "Descuento especial en pijama floral con corte femenino y tela suave.",
    price: 29.9,
    oldPrice: 39.9,
    material: "Algodón premium",
    colors: ["Rojo"],
    sizes: ["S", "M", "L"],
    stock: 15,
    active: true,
    tags: ["oferta", "tendencia"],
    category: { name: "Flores", slug: "flores" },
    images: [{ url: "/pijama1.png", alt: "Pijama roja flores" }]
  },
  {
    id: "offer-2",
    slug: "pijama-lila-encaje",
    name: "Pijama Lila Encaje",
    description: "Elegante pijama lila con detalles de encaje y precio especial.",
    price: 32.5,
    oldPrice: 42.5,
    material: "Seda ligera",
    colors: ["Lila"],
    sizes: ["S", "M", "L"],
    stock: 12,
    active: true,
    tags: ["oferta", "nuevo"],
    category: { name: "Encaje", slug: "encaje" },
    images: [{ url: "/pijama2.png", alt: "Pijama lila encaje" }]
  },
  {
    id: "offer-3",
    slug: "pijama-cereza-dulce",
    name: "Pijama Cereza Dulce",
    description: "Pijama fresca con detalles cereza, ideal para verano y temporada festiva.",
    price: 27.9,
    oldPrice: 35.0,
    material: "Algodón suave",
    colors: ["Blanco", "Rojo"],
    sizes: ["S", "M", "L"],
    stock: 10,
    active: true,
    tags: ["oferta", "verano"],
    category: { name: "Cereza", slug: "cereza" },
    images: [{ url: "/pijama3.png", alt: "Pijama cereza dulce" }]
  },
  {
    id: "offer-4",
    slug: "pijama-rosa-corazones",
    name: "Pijama Rosa Corazones",
    description: "Set romántico con corazones y acabado delicado, ahora en oferta.",
    price: 30.5,
    oldPrice: 39.0,
    material: "Algodón premium",
    colors: ["Rosa"],
    sizes: ["S", "M", "L"],
    stock: 14,
    active: true,
    tags: ["oferta", "nuevo"],
    category: { name: "Corazones", slug: "corazones" },
    images: [{ url: "/pijama1.png", alt: "Pijama rosa corazones" }]
  },
  {
    id: "offer-5",
    slug: "pijama-blanco-lunares",
    name: "Pijama Blanco Lunares",
    description: "Pijama con lunares delicados y precio especial de temporada.",
    price: 28.9,
    oldPrice: 36.0,
    material: "Modal suave",
    colors: ["Blanco"],
    sizes: ["S", "M", "L"],
    stock: 18,
    active: true,
    tags: ["oferta", "navidad"],
    category: { name: "Lunares", slug: "lunare" },
    images: [{ url: "/pijama1.png", alt: "Pijama blanco lunares" }]
  },
  {
    id: "offer-6",
    slug: "pijama-verde-jardin",
    name: "Pijama Verde Jardín",
    description: "Oferta de pijama botánica con estampado fresco para el descanso.",
    price: 31.9,
    oldPrice: 39.5,
    material: "Algodón premium",
    colors: ["Verde"],
    sizes: ["S", "M", "L"],
    stock: 16,
    active: true,
    tags: ["oferta", "temporada"],
    category: { name: "Jardín", slug: "jardin" },
    images: [{ url: "/pijama5.png", alt: "Pijama verde jardín" }]
  }
];

const trendCards = [
  { title: "Tendencias", description: "Las piezas más buscadas de la temporada boutique.", accent: "text-rose-500" },
  { title: "Temporada Verano", description: "Colores claros y tejidos frescos para noches cálidas.", accent: "text-amber-500" },
  { title: "Temporada Invierno", description: "Sets acogedores para sentirse abrigada en casa.", accent: "text-sky-500" },
  { title: "Temporada Navideña", description: "Ediciones limitadas con detalles festivos y románticos.", accent: "text-emerald-500" }
];

export default async function OfertasPage() {
  const products = (await fetchProducts("?offers=true")) ?? sampleOffers;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <BackBar fallbackHref="/" />
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <section className="mb-12 rounded-[3rem] bg-white p-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-200">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Ofertas</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">Pijamas en promoción</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Descubre pijamas boutique con descuentos exclusivos, nuevas temporadas y tendencias seleccionadas para tu descanso.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {trendCards.map((card) => (
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
