"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, ImagePlus, MapPin, MessageCircle, PackageCheck, UserRound } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackBar from "../../components/BackBar";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useCartStore } from "../../store/cart";
import { useAuthStore } from "../../store/auth";
import { useCheckoutStore } from "../../store/checkout";
import { createOrder } from "../../lib/api";

type Step = "personal" | "address" | "shipping" | "payment";
type ShippingMethod = "pickup" | "standard" | "express";
type PaymentMethod = "transferencia" | "tienda" | "pasarela";

type CheckoutErrors = Partial<Record<"firstName" | "lastName" | "email" | "phone" | "address" | "city" | "postalCode" | "shippingMethod" | "paymentMethod" | "receiptUrl", string>>;

const steps: { id: Step; label: string; icon: typeof UserRound }[] = [
  { id: "personal", label: "Datos personales", icon: UserRound },
  { id: "address", label: "Direccion", icon: MapPin },
  { id: "shipping", label: "Envio", icon: PackageCheck },
  { id: "payment", label: "Pago", icon: CreditCard }
];

const shippingOptions: Record<ShippingMethod, { label: string; description: string; price: number }> = {
  pickup: { label: "Retiro en tienda", description: "Coordina retiro por WhatsApp cuando tu pedido este listo.", price: 0 },
  standard: { label: "Envio estandar", description: "Entrega local programada.", price: 5.9 },
  express: { label: "Envio express", description: "Prioridad en preparacion y entrega.", price: 8.9 }
};

const sellerWhatsappNumber = process.env.NEXT_PUBLIC_SELLER_WHATSAPP_NUMBER ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+593979543962";

function fieldClass(hasError?: boolean) {
  return `w-full rounded-lg border px-4 py-3 text-sm outline-none ${hasError ? "border-rose-500 bg-rose-50" : "border-slate-200 bg-white"}`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function normalizeWhatsappNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

function createSellerWhatsappUrl(orderNumber: string, total: number, method: PaymentMethod) {
  const message =
    method === "transferencia"
      ? `Hola, realice el pedido ${orderNumber}, subi el comprobante en la web y necesito confirmar mi pago. Total: $${total.toFixed(2)}.`
      : `Hola, realice el pedido ${orderNumber} y quiero coordinar el pago/retiro. Total: $${total.toFixed(2)}.`;

  return `https://wa.me/${normalizeWhatsappNumber(sellerWhatsappNumber)}?text=${encodeURIComponent(message)}`;
}

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const restoreAuth = useAuthStore((state) => state.restore);
  const checkoutDraft = useCheckoutStore((state) => state.draft);
  const checkoutOwnerId = useCheckoutStore((state) => state.ownerId);
  const setCheckoutDraft = useCheckoutStore((state) => state.setDraft);
  const clearCheckoutDraft = useCheckoutStore((state) => state.clearDraft);
  const router = useRouter();

  const [step, setStep] = useState<Step>(checkoutDraft.step);
  const [firstName, setFirstName] = useState(checkoutDraft.firstName);
  const [lastName, setLastName] = useState(checkoutDraft.lastName);
  const [email, setEmail] = useState(checkoutDraft.email);
  const [phone, setPhone] = useState(checkoutDraft.phone);
  const [address, setAddress] = useState(checkoutDraft.address);
  const [city, setCity] = useState(checkoutDraft.city);
  const [postalCode, setPostalCode] = useState(checkoutDraft.postalCode);
  const [notes, setNotes] = useState(checkoutDraft.notes);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>(checkoutDraft.shippingMethod);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(checkoutDraft.paymentMethod);
  const [receiptUrl, setReceiptUrl] = useState(checkoutDraft.receiptUrl);
  const [receiptName, setReceiptName] = useState(checkoutDraft.receiptName);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [message, setMessage] = useState("");
  const [sellerWhatsappUrl, setSellerWhatsappUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const activeStepIndex = steps.findIndex((item) => item.id === step);
  const shipping = items.length > 0 ? shippingOptions[shippingMethod].price : 0;
  const grandTotal = subtotal + shipping;

  useEffect(() => {
    restoreAuth();
  }, [restoreAuth]);

  useEffect(() => {
    if (user?.email) setEmail((current) => current || user.email);
    if (user?.name) {
      const [first, ...rest] = user.name.split(" ");
      setFirstName((current) => current || first || "");
      setLastName((current) => current || rest.join(" "));
    }
  }, [user?.email, user?.name]);

  useEffect(() => {
    setStep(checkoutDraft.step);
    setFirstName(checkoutDraft.firstName);
    setLastName(checkoutDraft.lastName);
    setEmail(checkoutDraft.email);
    setPhone(checkoutDraft.phone);
    setAddress(checkoutDraft.address);
    setCity(checkoutDraft.city);
    setPostalCode(checkoutDraft.postalCode);
    setNotes(checkoutDraft.notes);
    setShippingMethod(checkoutDraft.shippingMethod);
    setPaymentMethod(checkoutDraft.paymentMethod);
    setReceiptUrl(checkoutDraft.receiptUrl);
    setReceiptName(checkoutDraft.receiptName);
  }, [checkoutOwnerId]);

  useEffect(() => {
    setCheckoutDraft({
      step,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postalCode,
      notes,
      shippingMethod,
      paymentMethod,
      receiptUrl,
      receiptName
    });
  }, [
    address,
    city,
    email,
    firstName,
    lastName,
    notes,
    paymentMethod,
    phone,
    postalCode,
    receiptName,
    receiptUrl,
    setCheckoutDraft,
    shippingMethod,
    step
  ]);

  const validateStep = (targetStep = step) => {
    const nextErrors: CheckoutErrors = {};

    if (targetStep === "personal") {
      if (!firstName.trim()) nextErrors.firstName = "Ingresa tu nombre.";
      if (!lastName.trim()) nextErrors.lastName = "Ingresa tu apellido.";
      if (!email.includes("@")) nextErrors.email = "Ingresa un email valido.";
      if (phone.trim().length < 7) nextErrors.phone = "Ingresa un telefono valido.";
    }

    if (targetStep === "address") {
      if (address.trim().length < 5) nextErrors.address = "Ingresa una direccion valida.";
      if (!city.trim()) nextErrors.city = "Ingresa la ciudad.";
      if (postalCode.trim().length < 3) nextErrors.postalCode = "Ingresa codigo postal o referencia.";
    }

    if (targetStep === "shipping" && !shippingMethod) {
      nextErrors.shippingMethod = "Selecciona un metodo de envio.";
    }

    if (targetStep === "payment" && !paymentMethod) {
      nextErrors.paymentMethod = "Selecciona un metodo de pago.";
    }
    if (targetStep === "payment" && paymentMethod === "transferencia" && !receiptUrl) {
      nextErrors.receiptUrl = "Sube el comprobante de transferencia.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    setMessage("");
    if (!validateStep()) return;
    const nextStep = steps[activeStepIndex + 1]?.id;
    if (nextStep) setStep(nextStep);
  };

  const goBack = () => {
    setMessage("");
    const previousStep = steps[activeStepIndex - 1]?.id;
    if (previousStep) setStep(previousStep);
  };

  const handleReceiptUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setErrors((current) => ({ ...current, receiptUrl: "Sube una imagen o PDF del comprobante." }));
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setReceiptUrl(dataUrl);
    setReceiptName(file.name);
    setErrors((current) => ({ ...current, receiptUrl: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setSellerWhatsappUrl("");

    if (items.length === 0) {
      setMessage("Tu carrito esta vacio. Agrega productos antes de continuar.");
      setStatus("error");
      return;
    }

    for (const checkoutStep of steps) {
      if (!validateStep(checkoutStep.id)) {
        setStep(checkoutStep.id);
        setStatus("error");
        return;
      }
    }

    setStatus("loading");

    const orderData = {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postalCode,
      notes,
      shippingMethod,
      paymentMethod,
      receiptUrl: paymentMethod === "transferencia" ? receiptUrl : undefined,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }))
    };

    const order = await createOrder(orderData, token);

    if (!order?.order) {
      setStatus("error");
      setMessage(order?.error ?? "No se pudo procesar el pedido. Intenta nuevamente mas tarde.");
      return;
    }

    clearCart();
    clearCheckoutDraft();
    setStatus("success");
    setMessage(`Pedido ${order.order.number} creado con exito. Gracias por tu compra!`);

    const nextWhatsappUrl = createSellerWhatsappUrl(order.order.number, order.order.total ?? grandTotal, paymentMethod);
    if (paymentMethod === "transferencia" || paymentMethod === "tienda") {
      setSellerWhatsappUrl(nextWhatsappUrl);
      window.open(nextWhatsappUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setTimeout(() => router.push("/catalogo"), 3200);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <BackBar />
      <main className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-rose-500">Checkout</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Finaliza tu compra</h1>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-2 sm:grid-cols-4">
              {steps.map((item, index) => {
                const Icon = item.icon;
                const active = item.id === step;
                const complete = index < activeStepIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => (index <= activeStepIndex ? setStep(item.id) : null)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-left text-xs font-semibold ${active ? "border-slate-950 bg-slate-950 text-white" : complete ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"}`}
                  >
                    {complete ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    {item.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {step === "personal" && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Datos personales</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1 text-sm font-semibold text-slate-700">
                      Nombre
                      <input value={firstName} onChange={(event) => setFirstName(event.target.value)} className={fieldClass(Boolean(errors.firstName))} />
                      {errors.firstName ? <span className="text-xs text-rose-600">{errors.firstName}</span> : null}
                    </label>
                    <label className="space-y-1 text-sm font-semibold text-slate-700">
                      Apellido
                      <input value={lastName} onChange={(event) => setLastName(event.target.value)} className={fieldClass(Boolean(errors.lastName))} />
                      {errors.lastName ? <span className="text-xs text-rose-600">{errors.lastName}</span> : null}
                    </label>
                    <label className="space-y-1 text-sm font-semibold text-slate-700">
                      Email
                      <input value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass(Boolean(errors.email))} />
                      {errors.email ? <span className="text-xs text-rose-600">{errors.email}</span> : null}
                    </label>
                    <label className="space-y-1 text-sm font-semibold text-slate-700">
                      Telefono
                      <input value={phone} onChange={(event) => setPhone(event.target.value)} className={fieldClass(Boolean(errors.phone))} />
                      {errors.phone ? <span className="text-xs text-rose-600">{errors.phone}</span> : null}
                    </label>
                  </div>
                </div>
              )}

              {step === "address" && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Direccion de entrega</h2>
                  <div className="mt-4 space-y-4">
                    <label className="space-y-1 text-sm font-semibold text-slate-700">
                      Direccion
                      <input value={address} onChange={(event) => setAddress(event.target.value)} className={fieldClass(Boolean(errors.address))} />
                      {errors.address ? <span className="text-xs text-rose-600">{errors.address}</span> : null}
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-1 text-sm font-semibold text-slate-700">
                        Ciudad
                        <input value={city} onChange={(event) => setCity(event.target.value)} className={fieldClass(Boolean(errors.city))} />
                        {errors.city ? <span className="text-xs text-rose-600">{errors.city}</span> : null}
                      </label>
                      <label className="space-y-1 text-sm font-semibold text-slate-700">
                        Codigo postal / referencia
                        <input value={postalCode} onChange={(event) => setPostalCode(event.target.value)} className={fieldClass(Boolean(errors.postalCode))} />
                        {errors.postalCode ? <span className="text-xs text-rose-600">{errors.postalCode}</span> : null}
                      </label>
                    </div>
                    <label className="space-y-1 text-sm font-semibold text-slate-700">
                      Notas del pedido
                      <textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                    </label>
                  </div>
                </div>
              )}

              {step === "shipping" && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Metodo de envio</h2>
                  <div className="mt-4 grid gap-3">
                    {(Object.keys(shippingOptions) as ShippingMethod[]).map((method) => (
                      <label key={method} className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4 ${shippingMethod === method ? "border-slate-950 bg-slate-50" : "border-slate-200 bg-white"}`}>
                        <span className="flex items-start gap-3">
                          <input type="radio" checked={shippingMethod === method} onChange={() => setShippingMethod(method)} className="mt-1" />
                          <span>
                            <span className="block font-semibold text-slate-900">{shippingOptions[method].label}</span>
                            <span className="text-sm text-slate-500">{shippingOptions[method].description}</span>
                          </span>
                        </span>
                        <span className="font-semibold text-slate-950">${shippingOptions[method].price.toFixed(2)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {step === "payment" && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Pago</h2>
                  <div className="mt-4 space-y-3">
                    <label className={`block rounded-lg border p-4 text-sm ${paymentMethod === "transferencia" ? "border-slate-950 bg-slate-50" : "border-slate-200 bg-white"}`}>
                      <span className="flex items-start gap-3">
                        <input type="radio" name="payment" checked={paymentMethod === "transferencia"} onChange={() => setPaymentMethod("transferencia")} className="mt-1" />
                        <span>
                          <span className="block font-semibold text-slate-900">Transferencia bancaria</span>
                          <span className="text-slate-500">Sube el comprobante para que el equipo confirme el pago antes de preparar el pedido.</span>
                        </span>
                      </span>
                      {paymentMethod === "transferencia" ? (
                        <div className={`mt-4 rounded-lg border p-4 ${errors.receiptUrl ? "border-rose-500 bg-rose-50" : "border-slate-200 bg-white"}`}>
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                            <ImagePlus className="h-4 w-4" />
                            Subir comprobante
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={(event) => {
                                void handleReceiptUpload(event.target.files);
                                event.currentTarget.value = "";
                              }}
                            />
                          </label>
                          {receiptName ? <p className="mt-3 text-sm font-semibold text-emerald-700">Comprobante cargado: {receiptName}</p> : null}
                          {errors.receiptUrl ? <p className="mt-3 text-sm text-rose-600">{errors.receiptUrl}</p> : null}
                        </div>
                      ) : null}
                    </label>

                    <label className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${paymentMethod === "tienda" ? "border-slate-950 bg-slate-50" : "border-slate-200 bg-white"}`}>
                      <input type="radio" name="payment" checked={paymentMethod === "tienda"} onChange={() => setPaymentMethod("tienda")} className="mt-1" />
                      <span>
                        <span className="block font-semibold text-slate-900">Pago en tienda</span>
                        <span className="text-slate-500">El pedido queda pendiente y se paga al retirar o al coordinar con la boutique.</span>
                      </span>
                    </label>

                    <label className="flex cursor-not-allowed items-start gap-3 rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-400">
                      <input type="radio" name="payment" disabled className="mt-1" />
                      <span>
                        <span className="block font-semibold">Pasarela de pago</span>
                        <span>Proximamente. Tarjeta/online quedara habilitado cuando se integre el proveedor.</span>
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {message ? (
                <div className={`rounded-lg p-4 text-sm ${status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  <p>{message}</p>
                  {sellerWhatsappUrl ? (
                    <a
                      href={sellerWhatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contactar vendedor por WhatsApp
                    </a>
                  ) : null}
                </div>
              ) : null}

              <div className="flex gap-3">
                {activeStepIndex > 0 ? (
                  <button type="button" onClick={goBack} className="flex-1 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                    Atras
                  </button>
                ) : null}
                {step !== "payment" ? (
                  <button type="button" onClick={goNext} className="flex-1 rounded-lg bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                    Siguiente
                  </button>
                ) : (
                  <button type="submit" disabled={status === "loading"} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400">
                    {status === "loading" ? <LoadingSpinner /> : null}
                    {status === "loading" ? "Procesando pedido..." : "Pagar y confirmar"}
                  </button>
                )}
              </div>
            </form>
          </section>

          <aside className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-950">Resumen del pedido</h2>
            <div className="space-y-3 text-slate-700">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span>Envio</span><span>${shipping.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span>Descuento</span><span>$0.00</span></div>
              <div className="border-t border-slate-200 pt-4 text-lg font-semibold text-slate-950 flex items-center justify-between">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-900">Productos</p>
              <div className="mt-3 space-y-3">
                {items.length > 0 ? (
                  items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.quantity} x ${item.price.toFixed(2)}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Aun no tienes productos en el carrito.</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
              Puedes comprar como invitado. Si iniciaste sesion, el pedido tambien quedara guardado en tu cuenta.
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
