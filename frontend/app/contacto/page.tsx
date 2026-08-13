"use client";

import { FormEvent, useState } from "react";
import { Mail, MapPin, MessageCircle, Send, UserRound } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

type ContactErrors = {
  name?: string;
  email?: string;
  message?: string;
};

const sellerWhatsappNumber = process.env.NEXT_PUBLIC_SELLER_WHATSAPP_NUMBER ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+593979543962";
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hola@ninipijamas.ec";

function normalizeWhatsappNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

function fieldClass(hasError?: boolean) {
  return `mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
    hasError ? "border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-100" : "border-slate-200 focus:border-rose-300 focus:ring-rose-100"
  }`;
}

export default function ContactoPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sent, setSent] = useState(false);

  const validate = () => {
    const nextErrors: ContactErrors = {};
    const cleanEmail = email.trim();

    if (name.trim().length < 2) nextErrors.name = "Ingresa tu nombre.";
    if (!cleanEmail) {
      nextErrors.email = "Ingresa tu email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      nextErrors.email = "Ingresa un email valido.";
    }
    if (message.trim().length < 10) nextErrors.message = "Cuentanos un poco mas para poder ayudarte.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(false);
    if (!validate()) return;

    const text = `Hola, soy ${name.trim()} (${email.trim()}). ${message.trim()}`;
    window.open(`https://wa.me/${normalizeWhatsappNumber(sellerWhatsappNumber)}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="border-b border-slate-200 pb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Contacto</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-slate-950">Te ayudamos a elegir talla, stock o coordinar tu pedido</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Escribenos y te respondemos por WhatsApp o correo con la informacion que necesitas.
          </p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="space-y-4">
            <a
              href={`https://wa.me/${normalizeWhatsappNumber(sellerWhatsappNumber)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <MessageCircle className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-slate-950">WhatsApp</span>
                <span className="mt-1 block text-sm text-slate-600">{sellerWhatsappNumber}</span>
              </span>
            </a>

            <a
              href={`mailto:${contactEmail}`}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-rose-200 hover:bg-rose-50"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                <Mail className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-slate-950">Correo</span>
                <span className="mt-1 block text-sm text-slate-600">{contactEmail}</span>
              </span>
            </a>

            <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <MapPin className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-slate-950">Atencion</span>
                <span className="mt-1 block text-sm text-slate-600">Pedidos, tallas y entregas coordinadas con la boutique.</span>
              </span>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Nombre
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setErrors((current) => ({ ...current, name: undefined }));
                    }}
                    className={`${fieldClass(Boolean(errors.name))} pl-11`}
                    placeholder="Tu nombre"
                    aria-invalid={Boolean(errors.name)}
                  />
                </div>
                {errors.name ? <span className="mt-2 block text-xs text-rose-600">{errors.name}</span> : null}
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Email
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setErrors((current) => ({ ...current, email: undefined }));
                    }}
                    className={`${fieldClass(Boolean(errors.email))} pl-11`}
                    placeholder="correo@ejemplo.com"
                    aria-invalid={Boolean(errors.email)}
                  />
                </div>
                {errors.email ? <span className="mt-2 block text-xs text-rose-600">{errors.email}</span> : null}
              </label>
            </div>

            <label className="mt-5 block text-sm font-semibold text-slate-700">
              Mensaje
              <textarea
                rows={6}
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  setErrors((current) => ({ ...current, message: undefined }));
                }}
                className={fieldClass(Boolean(errors.message))}
                placeholder="Cuentanos que necesitas: talla, producto, envio o disponibilidad."
                aria-invalid={Boolean(errors.message)}
              />
              {errors.message ? <span className="mt-2 block text-xs text-rose-600">{errors.message}</span> : null}
            </label>

            {sent ? <p className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Abrimos WhatsApp con tu mensaje listo para enviar.</p> : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-700">
                <Send className="h-4 w-4" />
                Enviar por WhatsApp
              </button>
              <a
                href={`mailto:${contactEmail}?subject=${encodeURIComponent("Consulta Nini Pijamas")}`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Mail className="h-4 w-4" />
                Enviar correo
              </a>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}
