import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductSearchFilter from "../../components/ProductSearchFilter";
import { fetchProducts } from "../../lib/api";
import { Product } from "../../types";

const sampleProducts: Product[] = [
  {
    id: "sample-1",
    slug: "pijama-corazones-rosa",
    name: "Pijama Corazones Rosa",
    description: "Estampado romántico de corazones y detalles delicados en tela ligera.",
    price: 32.9,
    oldPrice: 39.9,
    material: "Algodón premium",
    colors: ["Rosa"],
    sizes: ["S", "M", "L"],
    stock: 20,
    active: true,
    tags: ["nuevo", "oferta"],
    category: { name: "Corazones", slug: "corazones" },
    images: [{ url: "/pijama1.png", alt: "Pijama rosa corazones" }]
  },
  {
    id: "sample-2",
    slug: "pijama-cereza-dulce",
    name: "Pijama Cereza Dulce",
    description: "Un set fresco con estampado de cerezas y detalles femeninos.",
    price: 34.5,
    oldPrice: null,
    material: "Algodón suave",
    colors: ["Blanco", "Rojo"],
    sizes: ["S", "M", "L"],
    stock: 18,
    active: true,
    tags: ["popular"],
    category: { name: "Cereza", slug: "cereza" },
    images: [{ url: "/pijama2.png", alt: "Pijama con cerezas" }]
  },
  {
    id: "sample-3",
    slug: "pijama-rosas-delicadas",
    name: "Pijama Rosas Delicadas",
    description: "Diseño boutique con estampado floral y acabados suaves.",
    price: 36.9,
    oldPrice: 44.9,
    material: "Viscosa ligera",
    colors: ["Marfil", "Rosa"],
    sizes: ["S", "M", "L"],
    stock: 12,
    active: true,
    tags: ["destacado"],
    category: { name: "Floral", slug: "floral" },
    images: [{ url: "/pijama3.png", alt: "Pijama con rosas" }]
  }
];

export default async function CatalogoPage() {
  const products = (await fetchProducts("?sort=new")) ?? sampleProducts;
  const displayProducts = products.length > 0 ? products : sampleProducts;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-[3rem] bg-white p-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-200">
          <div className="mb-10 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Catálogo</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-900">Pijamas premium para cada noche</h1>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700">
              {displayProducts.length} artículos disponibles
            </div>
          </div>
          <p className="max-w-2xl text-slate-600">Descubre pijamas femeninas con texturas suaves, estampados delicados y cortes cómodos. Filtra por estilo, color y talla para encontrar tu favorito.</p>
        </section>

        <ProductSearchFilter initialProducts={displayProducts} />
      </main>
      <Footer />
    </div>
  );
}
