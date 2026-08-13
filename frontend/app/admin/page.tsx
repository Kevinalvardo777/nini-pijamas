"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Edit3,
  ImagePlus,
  Plus,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  Users
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import { apiUrl } from "../../lib/api";
import { useAuthStore } from "../../store/auth";
import { Product } from "../../types";

type AdminStats = {
  totalSales: number;
  ordersCount: number;
  usersCount: number;
  productsCount: number;
  activeProducts: number;
  lowStockProducts: number;
  averageTicket: string;
  productsBySales: { productId: string; name: string; _sum: { quantity: number | null } }[];
  salesByDay: Record<string, number>;
  salesByCategory: Record<string, number>;
  pendingOrders: number;
  paidOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  canceledOrders: number;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  permissions: string[];
  createdAt: string;
  _count: { orders: number };
};

type RoleInfo = {
  role: "ADMIN" | "CUSTOMER";
  permissions: string[];
};

type OrderRow = {
  id: string;
  number: string;
  status: string;
  total: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  items: { id: string; name: string; quantity: number; price: number }[];
};

type EditableProduct = Product & {
  categoryId?: string;
};

type AdminProductImage = {
  url: string;
  alt: string;
  isPrimary?: boolean;
  position?: number;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  oldPrice: string;
  category: { name: string; slug: string };
  material: string[];
  colors: string[];
  sizes: string[];
  stock: string;
  active: boolean;
  tags: string[];
  images: AdminProductImage[];
};

type ProductFieldErrors = Partial<Record<"name" | "description" | "price" | "sizes" | "images" | "submit", string>>;

const money = new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" });
const categoryOptions = ["Sweet Sleep", "Boutique", "Temporada"];
const materialOptions = ["Algodon premium", "Seda ligera", "Gamusa", "Satín", "Modal", "Franela"];
const colorOptions = ["Blanco", "Rosa", "Lila", "Negro", "Azul", "Verde", "Rojo", "Beige"];
const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
const tagOptions = ["nuevo", "oferta", "destacado", "temporada", "boutique", "edicion-limitada"];
const tabs = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "productos", label: "Productos", icon: Boxes },
  { id: "usuarios", label: "Usuarios", icon: Users },
  { id: "reportes", label: "Reportes", icon: ClipboardList }
] as const;

type TabId = (typeof tabs)[number]["id"];

const createEmptyProduct = (): ProductForm => ({
  name: "",
  description: "",
  price: "",
  oldPrice: "",
  category: { name: "", slug: "" },
  material: [],
  colors: [],
  sizes: [],
  stock: "",
  active: true,
  tags: [],
  images: []
});

function authHeaders(token: string | null) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

function parseCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function numericValue(value: string, allowDecimal = true) {
  const pattern = allowDecimal ? /[^\d.]/g : /\D/g;
  const cleaned = value.replace(pattern, "");
  if (!allowDecimal) return cleaned;
  const [first, ...rest] = cleaned.split(".");
  return rest.length > 0 ? `${first}.${rest.join("")}` : cleaned;
}

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function fieldClass(hasError?: boolean) {
  return `w-full rounded-md border px-3 py-2 font-normal ${
    hasError ? "border-rose-500 bg-rose-50 outline-rose-500" : "border-slate-200"
  }`;
}

function markPrimaryImage(images: AdminProductImage[], imageIndex: number): AdminProductImage[] {
  return images.map((image, index) => ({ ...image, isPrimary: index === imageIndex, position: index }));
}

function ensurePrimaryImages<T extends { images: AdminProductImage[] }>(product: T): T {
  if (product.images.length === 0 || product.images.some((image) => image.isPrimary)) {
    return product;
  }

  return { ...product, images: markPrimaryImage(product.images, 0) };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function serializeProduct(product: EditableProduct | ProductForm) {
  const material = Array.isArray(product.material) ? product.material.join(", ") : product.material;
  const primaryIndex = Math.max(0, product.images.findIndex((image) => image.isPrimary));
  return {
    name: product.name,
    description: product.description,
    price: Number(product.price),
    oldPrice: product.oldPrice === "" || product.oldPrice === null || product.oldPrice === undefined ? undefined : Number(product.oldPrice),
    category: product.category.name,
    material,
    colors: product.colors,
    sizes: product.sizes,
    stock: Number(product.stock),
    active: product.active,
    tags: product.tags,
    images: product.images.map((image, index) => ({
      ...image,
      isPrimary: index === primaryIndex,
      position: index
    }))
  };
}

function BarList({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-3">
      {data.length === 0 ? (
        <p className="text-sm text-slate-500">Sin datos todavia.</p>
      ) : (
        data.map((item) => (
          <div key={item.label} className="grid grid-cols-[7rem_1fr_4rem] items-center gap-3 text-sm">
            <span className="truncate text-slate-600" title={item.label}>
              {item.label}
            </span>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-rose-400" style={{ width: `${Math.max((item.value / max) * 100, 4)}%` }} />
            </div>
            <span className="text-right font-semibold text-slate-800">{Number.isInteger(item.value) ? item.value : money.format(item.value)}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default function AdminPage() {
  const { token, user, restore } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<EditableProduct[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState<ProductForm>(() => createEmptyProduct());
  const [newProductErrors, setNewProductErrors] = useState<ProductFieldErrors>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isAdmin = user?.role === "ADMIN";

  const loadAdminData = async () => {
    if (!token) return;
    setLoading(true);
    setActionLoading("refresh");
    setMessage("");
    try {
      const [statsRes, productsRes, usersRes, ordersRes] = await Promise.all([
        fetch(`${apiUrl}/admin/stats`, { headers: authHeaders(token), cache: "no-store" }),
        fetch(`${apiUrl}/admin/productos`, { headers: authHeaders(token), cache: "no-store" }),
        fetch(`${apiUrl}/admin/usuarios`, { headers: authHeaders(token), cache: "no-store" }),
        fetch(`${apiUrl}/admin/pedidos`, { headers: authHeaders(token), cache: "no-store" })
      ]);

      if (![statsRes, productsRes, usersRes, ordersRes].every((response) => response.ok)) {
        throw new Error("No se pudo cargar la informacion administrativa.");
      }

      const [statsData, productsData, usersData, ordersData] = await Promise.all([
        statsRes.json(),
        productsRes.json(),
        usersRes.json(),
        ordersRes.json()
      ]);

      setStats(statsData);
      setProducts((productsData.products ?? []).map(ensurePrimaryImages));
      setUsers(usersData.users ?? []);
      setRoles(usersData.roles ?? []);
      setAllPermissions(usersData.permissions ?? []);
      setOrders(ordersData.orders ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al cargar el panel.");
    } finally {
      setLoading(false);
      setActionLoading(null);
    }
  };

  useEffect(() => {
    restore();
  }, [restore]);

  useEffect(() => {
    if (token && isAdmin) {
      void loadAdminData();
    } else {
      setLoading(false);
    }
  }, [token, isAdmin]);

  const salesByDay = useMemo(
    () =>
      Object.entries(stats?.salesByDay ?? {})
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-7)
        .map(([label, value]) => ({ label: label.slice(5), value })),
    [stats]
  );

  const salesByCategory = useMemo(
    () => Object.entries(stats?.salesByCategory ?? {}).map(([label, value]) => ({ label, value })),
    [stats]
  );

  const productsBySales = useMemo(
    () =>
      (stats?.productsBySales ?? []).map((item) => ({
        label: item.name,
        value: item._sum.quantity ?? 0
      })),
    [stats]
  );

  const updateProductField = <K extends keyof EditableProduct>(slug: string, key: K, value: EditableProduct[K]) => {
    setProducts((current) => current.map((product) => (product.slug === slug ? { ...product, [key]: value } : product)));
  };

  const updateNewProductField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setNewProduct((current) => ({ ...current, [key]: value }));
    setNewProductErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validateNewProduct = () => {
    const errors: ProductFieldErrors = {};
    if (!newProduct.name.trim()) {
      errors.name = "El nombre es obligatorio.";
    }
    if (!newProduct.description.trim()) {
      errors.description = "La descripcion es obligatoria.";
    }
    if (!newProduct.price || Number(newProduct.price) <= 0) {
      errors.price = "Ingresa un precio actual mayor a 0.";
    }
    if (newProduct.sizes.length === 0) {
      errors.sizes = "Selecciona al menos una talla.";
    }
    if (newProduct.images.length === 0) {
      errors.images = "Sube al menos una imagen del producto.";
    }

    setNewProductErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addProductImages = async (product: EditableProduct, files: FileList | null) => {
    if (!files?.length) return;

    const selectedFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (selectedFiles.length === 0) {
      setMessage("Selecciona archivos de imagen validos.");
      return;
    }

    try {
      const uploadedImages: AdminProductImage[] = await Promise.all(
        selectedFiles.map(async (file) => ({
          url: await readFileAsDataUrl(file),
          alt: `${product.name} - ${file.name.replace(/\.[^.]+$/, "")}`
        }))
      );

      const nextImages = [...product.images, ...uploadedImages];
      updateProductField(product.slug, "images", nextImages.some((image) => image.isPrimary) ? nextImages : markPrimaryImage(nextImages, 0));
      setMessage(`${uploadedImages.length} imagen(es) listas para guardar.`);
    } catch {
      setMessage("No se pudieron leer las imagenes seleccionadas.");
    }
  };

  const removeProductImage = (product: EditableProduct, imageIndex: number) => {
    const nextImages = product.images.filter((_, index) => index !== imageIndex);
    updateProductField(product.slug, "images", nextImages.some((image) => image.isPrimary) ? nextImages : markPrimaryImage(nextImages, 0));
  };

  const updateProductImageAlt = (product: EditableProduct, imageIndex: number, alt: string) => {
    updateProductField(
      product.slug,
      "images",
      product.images.map((image, index) => (index === imageIndex ? { ...image, alt } : image))
    );
  };

  const setProductPrimaryImage = (product: EditableProduct, imageIndex: number) => {
    updateProductField(product.slug, "images", markPrimaryImage(product.images, imageIndex));
  };

  const addNewProductImages = async (files: FileList | null) => {
    if (!files?.length) return;

    const selectedFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (selectedFiles.length === 0) {
      setMessage("Selecciona archivos de imagen validos.");
      return;
    }

    try {
      const uploadedImages: AdminProductImage[] = await Promise.all(
        selectedFiles.map(async (file) => ({
          url: await readFileAsDataUrl(file),
          alt: `${newProduct.name || "Producto"} - ${file.name.replace(/\.[^.]+$/, "")}`
        }))
      );

      setNewProduct((current) => {
        const nextImages = [...current.images, ...uploadedImages];
        return { ...current, images: nextImages.some((image) => image.isPrimary) ? nextImages : markPrimaryImage(nextImages, 0) };
      });
      setNewProductErrors((current) => ({ ...current, images: undefined }));
      setMessage(`${uploadedImages.length} imagen(es) listas para el producto nuevo.`);
    } catch {
      setMessage("No se pudieron leer las imagenes seleccionadas.");
    }
  };

  const removeNewProductImage = (imageIndex: number) => {
    setNewProduct((current) => ({
      ...current,
      images: (() => {
        const nextImages = current.images.filter((_, index) => index !== imageIndex);
        return nextImages.some((image) => image.isPrimary) ? nextImages : markPrimaryImage(nextImages, 0);
      })()
    }));
  };

  const updateNewProductImageAlt = (imageIndex: number, alt: string) => {
    setNewProduct((current) => ({
      ...current,
      images: current.images.map((image, index) => (index === imageIndex ? { ...image, alt } : image))
    }));
  };

  const setNewProductPrimaryImage = (imageIndex: number) => {
    setNewProduct((current) => ({ ...current, images: markPrimaryImage(current.images, imageIndex) }));
  };

  const createProduct = async () => {
    if (!token) return;
    setMessage("");
    setNewProductErrors({});

    if (!validateNewProduct()) {
      setMessage("Revisa los campos obligatorios del producto.");
      return;
    }

    setActionLoading("create-product");
    try {
      const response = await fetch(`${apiUrl}/products`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(serializeProduct(newProduct))
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const errorMessage = data?.error ?? "No se pudo crear el producto.";
        setNewProductErrors({ submit: errorMessage });
        setMessage(errorMessage);
        return;
      }

      setNewProduct(createEmptyProduct());
      setShowNewProductForm(false);
      setMessage("Producto creado y visible para clientes.");
      await loadAdminData();
    } catch {
      const errorMessage = "No se pudo conectar con el backend. Verifica que http://localhost:4000/api este levantado.";
      setNewProductErrors({ submit: errorMessage });
      setMessage(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const saveProduct = async (product: EditableProduct) => {
    if (!token) return;
    setMessage("");
    setActionLoading(`save-product-${product.id}`);
    try {
      const response = await fetch(`${apiUrl}/products/${product.slug}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify(serializeProduct(product))
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setMessage(data?.error ?? "No se pudo guardar el producto.");
        return;
      }

      setEditingProduct(null);
      setMessage("Producto actualizado.");
      await loadAdminData();
    } finally {
      setActionLoading(null);
    }
  };

  const changeUserRole = async (selectedUser: AdminUser, role: "ADMIN" | "CUSTOMER") => {
    if (!token) return;
    setActionLoading(`user-role-${selectedUser.id}`);
    try {
      const response = await fetch(`${apiUrl}/admin/usuarios/${selectedUser.id}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setMessage(data?.error ?? "No se pudo actualizar el usuario.");
        return;
      }

      setMessage("Rol actualizado.");
      await loadAdminData();
    } finally {
      setActionLoading(null);
    }
  };

  const changeUserPermission = async (selectedUser: AdminUser, permission: string) => {
    if (!token) return;
    const permissions = toggleValue(selectedUser.permissions, permission);
    setActionLoading(`user-permission-${selectedUser.id}-${permission}`);
    try {
      const response = await fetch(`${apiUrl}/admin/usuarios/${selectedUser.id}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ permissions })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setMessage(data?.error ?? "No se pudieron actualizar los permisos.");
        return;
      }

      setMessage("Permisos actualizados.");
      await loadAdminData();
    } finally {
      setActionLoading(null);
    }
  };

  if (!token || !isAdmin) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-rose-500">Acceso restringido</p>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">Panel administrativo</h1>
            <p className="mt-3 text-sm text-slate-600">Inicia sesion con una cuenta ADMIN para gestionar usuarios, productos, precios y reportes.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-rose-500">Panel admin</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Gestion administrativa</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Controla productos, precios, stock, usuarios, roles, permisos y reporteria operativa desde una sola vista.</p>
          </div>
          <button
            type="button"
            onClick={loadAdminData}
            disabled={loading || actionLoading === "refresh"}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {actionLoading === "refresh" ? <LoadingSpinner /> : <RefreshCw className="h-4 w-4" />}
            Actualizar
          </button>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto border-b border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
                  activeTab === tab.id ? "border-rose-500 text-rose-600" : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {message && <p className="mt-4 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
            <LoadingSpinner className="h-5 w-5 text-rose-600" />
            Cargando panel administrativo...
          </div>
        ) : (
          <div className="mt-6">
            {activeTab === "dashboard" && stats && (
              <section className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Ventas", value: money.format(stats.totalSales), icon: DollarSign },
                    { label: "Pedidos", value: stats.ordersCount, icon: ClipboardList },
                    { label: "Ticket promedio", value: money.format(Number(stats.averageTicket)), icon: BarChart3 },
                    { label: "Usuarios", value: stats.usersCount, icon: Users },
                    { label: "Productos", value: stats.productsCount, icon: Boxes },
                    { label: "Activos", value: stats.activeProducts, icon: CheckCircle2 },
                    { label: "Stock bajo", value: stats.lowStockProducts, icon: Boxes },
                    { label: "Pagados", value: stats.paidOrders, icon: DollarSign }
                  ].map((metric) => {
                    const Icon = metric.icon;
                    return (
                      <div key={metric.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm text-slate-500">{metric.label}</p>
                          <Icon className="h-4 w-4 text-rose-500" />
                        </div>
                        <p className="mt-3 text-2xl font-semibold text-slate-950">{metric.value}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="font-semibold text-slate-950">Ventas por dia</h2>
                    <div className="mt-5">
                      <BarList data={salesByDay} />
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="font-semibold text-slate-950">Ventas por categoria</h2>
                    <div className="mt-5">
                      <BarList data={salesByCategory} />
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="font-semibold text-slate-950">Productos mas vendidos</h2>
                    <div className="mt-5">
                      <BarList data={productsBySales} />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "productos" && (
              <section className="space-y-5">
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="font-semibold text-slate-950">Productos, precios e informacion</h2>
                      <p className="mt-1 text-sm text-slate-500">Crea productos nuevos o edita los existentes para el catalogo de clientes.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNewProductForm((current) => !current)}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      <Plus className="h-4 w-4" />
                      Nuevo producto
                    </button>
                  </div>

                  {showNewProductForm ? (
                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-5">
                      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="space-y-1 text-sm font-semibold text-slate-700">
                            Nombre
                            <input className={fieldClass(Boolean(newProductErrors.name))} value={newProduct.name} onChange={(event) => updateNewProductField("name", event.target.value)} />
                            {newProductErrors.name ? <span className="block text-xs font-normal text-rose-600">{newProductErrors.name}</span> : null}
                          </label>
                          <label className="space-y-1 text-sm font-semibold text-slate-700">
                            Categoria
                            <select className="w-full rounded-md border border-slate-200 px-3 py-2 font-normal" value={newProduct.category.name} onChange={(event) => updateNewProductField("category", { name: event.target.value, slug: "" })}>
                              <option value="">Selecciona una categoria</option>
                              {categoryOptions.map((category) => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                          </label>
                          <label className="space-y-1 text-sm font-semibold text-slate-700">
                            Precio
                            <input inputMode="decimal" className={fieldClass(Boolean(newProductErrors.price))} placeholder="Ej. 17" value={newProduct.price} onChange={(event) => updateNewProductField("price", numericValue(event.target.value))} />
                            {newProductErrors.price ? <span className="block text-xs font-normal text-rose-600">{newProductErrors.price}</span> : null}
                          </label>
                          <label className="space-y-1 text-sm font-semibold text-slate-700">
                            Precio anterior
                            <input inputMode="decimal" className="w-full rounded-md border border-slate-200 px-3 py-2 font-normal" placeholder="Ej. 25" value={newProduct.oldPrice} onChange={(event) => updateNewProductField("oldPrice", numericValue(event.target.value))} />
                          </label>
                          <label className="space-y-1 text-sm font-semibold text-slate-700">
                            Stock
                            <input inputMode="numeric" className="w-full rounded-md border border-slate-200 px-3 py-2 font-normal" placeholder="Ej. 20" value={newProduct.stock} onChange={(event) => updateNewProductField("stock", numericValue(event.target.value, false))} />
                          </label>
                          <div className="space-y-2 text-sm font-semibold text-slate-700 sm:col-span-2">
                            Colores
                            <div className="flex flex-wrap gap-2">
                              {colorOptions.map((color) => (
                                <label key={color} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 font-normal">
                                  <input type="checkbox" checked={newProduct.colors.includes(color)} onChange={() => updateNewProductField("colors", toggleValue(newProduct.colors, color))} />
                                  {color}
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2 text-sm font-semibold text-slate-700 sm:col-span-2">
                            Material
                            <div className="flex flex-wrap gap-2">
                              {materialOptions.map((material) => (
                                <label key={material} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 font-normal">
                                  <input type="checkbox" checked={newProduct.material.includes(material)} onChange={() => updateNewProductField("material", toggleValue(newProduct.material, material))} />
                                  {material}
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2 text-sm font-semibold text-slate-700 sm:col-span-2">
                            Tallas
                            <div className={`flex flex-wrap gap-2 rounded-md border p-2 ${newProductErrors.sizes ? "border-rose-500 bg-rose-50" : "border-transparent"}`}>
                              {sizeOptions.map((size) => (
                                <label key={size} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 font-normal">
                                  <input type="checkbox" checked={newProduct.sizes.includes(size)} onChange={() => updateNewProductField("sizes", toggleValue(newProduct.sizes, size))} />
                                  {size}
                                </label>
                              ))}
                            </div>
                            {newProductErrors.sizes ? <span className="block text-xs font-normal text-rose-600">{newProductErrors.sizes}</span> : null}
                          </div>
                          <label className="space-y-1 text-sm font-semibold text-slate-700 sm:col-span-2">
                            Descripcion
                            <textarea className={`h-24 ${fieldClass(Boolean(newProductErrors.description))}`} value={newProduct.description} onChange={(event) => updateNewProductField("description", event.target.value)} />
                            {newProductErrors.description ? <span className="block text-xs font-normal text-rose-600">{newProductErrors.description}</span> : null}
                          </label>
                          <div className="space-y-2 text-sm font-semibold text-slate-700 sm:col-span-2">
                            Tags
                            <div className="flex flex-wrap gap-2">
                              {tagOptions.map((tag) => (
                                <label key={tag} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 font-normal">
                                  <input type="checkbox" checked={newProduct.tags.includes(tag)} onChange={() => updateNewProductField("tags", toggleValue(newProduct.tags, tag))} />
                                  {tag}
                                </label>
                              ))}
                            </div>
                          </div>
                          <label className="inline-flex items-center gap-2 pt-7 text-sm font-semibold text-slate-700">
                            <input type="checkbox" checked={newProduct.active} onChange={(event) => updateNewProductField("active", event.target.checked)} />
                            Visible para clientes
                          </label>
                        </div>

                        <div className={`rounded-lg border bg-white p-4 ${newProductErrors.images ? "border-rose-500 bg-rose-50" : "border-slate-200"}`}>
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-800">Imagenes del producto</p>
                            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                              <ImagePlus className="h-4 w-4" />
                              Subir
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(event) => {
                                  void addNewProductImages(event.target.files);
                                  event.currentTarget.value = "";
                                }}
                              />
                            </label>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            {newProduct.images.length > 0 ? (
                              newProduct.images.map((image, index) => (
                                <div key={`${image.url.slice(0, 24)}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-2">
                                  <img src={image.url} alt={image.alt} className="h-28 w-full rounded object-cover" />
                                  <label className="mt-2 inline-flex w-full items-center gap-2 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                                    <input type="radio" name="new-product-primary-image" checked={Boolean(image.isPrimary)} onChange={() => setNewProductPrimaryImage(index)} />
                                    Principal
                                  </label>
                                  <input className="mt-2 w-full rounded border border-slate-200 px-2 py-1 text-xs" value={image.alt} onChange={(event) => updateNewProductImageAlt(index, event.target.value)} />
                                  <button type="button" onClick={() => removeNewProductImage(index)} className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Quitar
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-2 rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                                Sube una o varias imagenes para que aparezcan en catalogo y detalle.
                              </div>
                            )}
                          </div>
                          {newProductErrors.images ? <p className="mt-3 text-sm text-rose-600">{newProductErrors.images}</p> : null}
                          <button type="button" onClick={createProduct} disabled={actionLoading === "create-product"} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500">
                            {actionLoading === "create-product" ? <LoadingSpinner /> : <Save className="h-4 w-4" />}
                            {actionLoading === "create-product" ? "Creando..." : "Crear producto"}
                          </button>
                          {newProductErrors.submit ? <p className="mt-3 text-sm text-rose-600">{newProductErrors.submit}</p> : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="font-semibold text-slate-950">Catalogo actual</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-[1250px] w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3">Imagenes</th>
                        <th className="px-4 py-3">Categoria</th>
                        <th className="px-4 py-3">Precio</th>
                        <th className="px-4 py-3">Antes</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Opciones</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Accion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((product) => {
                        const editing = editingProduct === product.slug;
                        return (
                          <tr key={product.id} className="align-top">
                            <td className="px-4 py-3">
                              {editing ? (
                                <div className="space-y-2">
                                  <input className="w-72 rounded-md border border-slate-200 px-3 py-2" value={product.name} onChange={(event) => updateProductField(product.slug, "name", event.target.value)} />
                                  <textarea className="h-20 w-72 rounded-md border border-slate-200 px-3 py-2" value={product.description} onChange={(event) => updateProductField(product.slug, "description", event.target.value)} />
                                </div>
                              ) : (
                                <div>
                                  <p className="font-semibold text-slate-950">{product.name}</p>
                                  <p className="mt-1 line-clamp-2 max-w-xs text-slate-500">{product.description}</p>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="w-64 space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                  {product.images.length > 0 ? (
                                    product.images.map((image, index) => (
                                      <div key={`${image.url.slice(0, 24)}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-2">
                                        <img src={image.url} alt={image.alt} className="h-24 w-full rounded object-cover" />
                                        {editing ? (
                                          <div className="mt-2 space-y-2">
                                            <label className="inline-flex w-full items-center gap-2 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                                              <input type="radio" name={`primary-image-${product.id}`} checked={Boolean(image.isPrimary)} onChange={() => setProductPrimaryImage(product, index)} />
                                              Principal
                                            </label>
                                            <input
                                              className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                                              value={image.alt}
                                              onChange={(event) => updateProductImageAlt(product, index, event.target.value)}
                                            />
                                            <button
                                              type="button"
                                              onClick={() => removeProductImage(product, index)}
                                              className="inline-flex w-full items-center justify-center gap-1 rounded border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                              Quitar
                                            </button>
                                          </div>
                                        ) : null}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="col-span-2 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-500">
                                      Sin imagenes
                                    </div>
                                  )}
                                </div>
                                {editing ? (
                                  <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                                    <ImagePlus className="h-4 w-4" />
                                    Subir imagenes
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      className="hidden"
                                      onChange={(event) => {
                                        void addProductImages(product, event.target.files);
                                        event.currentTarget.value = "";
                                      }}
                                    />
                                  </label>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {editing ? (
                                <input className="w-36 rounded-md border border-slate-200 px-3 py-2" value={product.category.name} onChange={(event) => updateProductField(product.slug, "category", { ...product.category, name: event.target.value, slug: product.category.slug })} />
                              ) : (
                                product.category.name
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {editing ? (
                                <input type="number" className="w-24 rounded-md border border-slate-200 px-3 py-2" value={product.price} onChange={(event) => updateProductField(product.slug, "price", Number(event.target.value))} />
                              ) : (
                                money.format(product.price)
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {editing ? (
                                <input type="number" className="w-24 rounded-md border border-slate-200 px-3 py-2" value={product.oldPrice ?? ""} onChange={(event) => updateProductField(product.slug, "oldPrice", event.target.value ? Number(event.target.value) : null)} />
                              ) : (
                                product.oldPrice ? money.format(product.oldPrice) : "-"
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {editing ? (
                                <input type="number" className="w-20 rounded-md border border-slate-200 px-3 py-2" value={product.stock} onChange={(event) => updateProductField(product.slug, "stock", Number(event.target.value))} />
                              ) : (
                                product.stock
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {editing ? (
                                <div className="space-y-2">
                                  <input className="w-48 rounded-md border border-slate-200 px-3 py-2" value={product.colors.join(", ")} onChange={(event) => updateProductField(product.slug, "colors", parseCsv(event.target.value))} />
                                  <input className="w-48 rounded-md border border-slate-200 px-3 py-2" value={product.sizes.join(", ")} onChange={(event) => updateProductField(product.slug, "sizes", parseCsv(event.target.value))} />
                                  <input className="w-48 rounded-md border border-slate-200 px-3 py-2" value={product.tags.join(", ")} onChange={(event) => updateProductField(product.slug, "tags", parseCsv(event.target.value))} />
                                </div>
                              ) : (
                                <div className="max-w-48 text-slate-600">
                                  <p>{product.colors.join(", ")}</p>
                                  <p>{product.sizes.join(", ")}</p>
                                  <p className="text-xs text-rose-500">{product.tags.join(", ") || "sin tags"}</p>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <label className="inline-flex items-center gap-2">
                                <input type="checkbox" checked={product.active} disabled={!editing} onChange={(event) => updateProductField(product.slug, "active", event.target.checked)} />
                                <span>{product.active ? "Activo" : "Oculto"}</span>
                              </label>
                            </td>
                            <td className="px-4 py-3">
                              {editing ? (
                                <button type="button" onClick={() => saveProduct(product)} disabled={actionLoading === `save-product-${product.id}`} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500">
                                  {actionLoading === `save-product-${product.id}` ? <LoadingSpinner /> : <Save className="h-4 w-4" />}
                                  {actionLoading === `save-product-${product.id}` ? "Guardando..." : "Guardar"}
                                </button>
                              ) : (
                                <button type="button" onClick={() => setEditingProduct(product.slug)} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-slate-800 hover:bg-slate-50">
                                  <Edit3 className="h-4 w-4" />
                                  Editar
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "usuarios" && (
              <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="font-semibold text-slate-950">Usuarios y roles</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-[760px] w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Usuario</th>
                          <th className="px-4 py-3">Rol</th>
                          <th className="px-4 py-3">Pedidos</th>
                          <th className="px-4 py-3">Permisos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map((adminUser) => (
                          <tr key={adminUser.id}>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-950">{adminUser.name}</p>
                              <p className="text-slate-500">{adminUser.email}</p>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                className="rounded-md border border-slate-200 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                                value={adminUser.role}
                                disabled={actionLoading === `user-role-${adminUser.id}`}
                                onChange={(event) => changeUserRole(adminUser, event.target.value as "ADMIN" | "CUSTOMER")}
                              >
                                <option value="ADMIN">ADMIN</option>
                                <option value="CUSTOMER">CUSTOMER</option>
                              </select>
                              {actionLoading === `user-role-${adminUser.id}` ? <LoadingSpinner className="ml-2 h-4 w-4 text-slate-500" /> : null}
                            </td>
                            <td className="px-4 py-3">{adminUser._count.orders}</td>
                            <td className="px-4 py-3">
                              <div className="grid max-w-xl gap-2 sm:grid-cols-2">
                                {allPermissions.map((permission) => (
                                  <label key={permission} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700">
                                    <input
                                      type="checkbox"
                                      checked={adminUser.permissions.includes(permission)}
                                      disabled={actionLoading === `user-permission-${adminUser.id}-${permission}`}
                                      onChange={() => changeUserPermission(adminUser, permission)}
                                    />
                                    {actionLoading === `user-permission-${adminUser.id}-${permission}` ? <LoadingSpinner className="h-3.5 w-3.5 text-slate-500" /> : null}
                                    {permission}
                                  </label>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-rose-500" />
                    <h2 className="font-semibold text-slate-950">Matriz de permisos</h2>
                  </div>
                  <div className="mt-5 space-y-5">
                    {roles.map((role) => (
                      <div key={role.role}>
                        <p className="text-sm font-semibold text-slate-900">{role.role}</p>
                        <ul className="mt-2 space-y-2 text-sm text-slate-600">
                          {role.permissions.map((permission) => (
                            <li key={permission} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              {permission}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeTab === "reportes" && (
              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="font-semibold text-slate-950">Reporteria de pedidos</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-[900px] w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Pedido</th>
                        <th className="px-4 py-3">Cliente</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Productos</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-4 py-3 font-semibold text-slate-950">{order.number}</td>
                          <td className="px-4 py-3">
                            <p>{order.firstName} {order.lastName}</p>
                            <p className="text-slate-500">{order.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{order.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            {order.items.map((item) => (
                              <p key={item.id} className="text-slate-600">
                                {item.quantity}x {item.name}
                              </p>
                            ))}
                          </td>
                          <td className="px-4 py-3 font-semibold">{money.format(order.total)}</td>
                          <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString("es-EC")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
