import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nini Pijamas - Producto",
  description: "Detalle de producto de Nini Pijamas"
};

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
