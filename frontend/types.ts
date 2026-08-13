export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number | null;
  material: string;
  colors: string[];
  sizes: string[];
  stock: number;
  active: boolean;
  tags: string[];
  category: { name: string; slug: string };
  images: { url: string; alt: string; isPrimary?: boolean; position?: number }[];
};

export type CartItem = {
  id: string;
  productId: string;
  slug?: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  quantity: number;
  size: string;
  color: string;
  image: string;
};
