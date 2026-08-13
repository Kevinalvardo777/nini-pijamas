import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import ProductDetail from "../../../components/ProductDetail";
import { fetchProductBySlug } from "../../../lib/api";
import { Product } from "../../../types";

type Props = {
  params: { slug: string };
};

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
    images: [{ url: "/pijama1.png", alt: "Pijama rosa corazones" }, { url: "/pijama2.png", alt: "Pijama rosa" }]
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
    images: [{ url: "/pijama2.png", alt: "Pijama con cerezas" }, { url: "/pijama3.png", alt: "Pijama blanca con corazones" }]
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
    images: [{ url: "/pijama3.png", alt: "Pijama con rosas" }, { url: "/pijama1.png", alt: "Pijama rosa" }]
  }
];

export default async function ProductPage({ params }: Props) {
  const product = (await fetchProductBySlug(params.slug)) ?? sampleProducts.find((item) => item.slug === params.slug);
  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <ProductDetail product={product} />
      </main>
      <Footer />
    </div>
  );
}
