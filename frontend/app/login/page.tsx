"use client";

import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackBar from "../../components/BackBar";
import LoadingSpinner from "../../components/LoadingSpinner";
import { loginUser, apiUrl } from "../../lib/api";
import { useAuthStore } from "../../store/auth";

type LoginErrors = {
  email?: string;
  password?: string;
};

function inputClass(hasError?: boolean) {
  return `w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
    hasError ? "border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-100" : "border-slate-200 focus:border-rose-300 focus:ring-rose-100"
  }`;
}

function getPostLoginPath(user?: { id: string; role: string }) {
  if (!user) return "/catalogo";
  if (user.role === "ADMIN") return "/admin";
  return "/catalogo";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(getPostLoginPath(user ?? undefined));
    }
  }, [isAuthenticated, router, user]);

  const validate = () => {
    const nextErrors: LoginErrors = {};
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      nextErrors.email = "Ingresa tu email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      nextErrors.email = "Ingresa un email valido.";
    }

    if (!password) {
      nextErrors.password = "Ingresa tu contrasena.";
    } else if (password.length < 6) {
      nextErrors.password = "La contrasena debe tener al menos 6 caracteres.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    const data = await loginUser(email.trim(), password);
    setLoading(false);

    if (!data) {
      setError("Error de conexion. Revisa que el servidor este activo.");
      return;
    }

    if (data.error) {
      setError(data.error);
      return;
    }

    if (!data.token) {
      setError("Email o contrasena incorrectos. Intenta de nuevo.");
      return;
    }

    setAuth(data.token, data.user);
    router.push(getPostLoginPath(data.user));
  };

  const showDemo = process.env.NEXT_PUBLIC_SHOW_DEMO === "true";

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // Clipboard can be unavailable in some browsers.
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <BackBar fallbackHref="/" />
      <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-5xl flex-col justify-center px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <aside className="border-b border-slate-200 bg-rose-50 p-8 sm:p-10 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-5">
                <img src="/nini-pijamas-logo.png" alt="Nini Pijamas" className="h-24 w-24 object-contain" />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Bienvenido a</p>
                  <h1 className="text-2xl font-semibold text-slate-950">Nini Pijamas</h1>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.25em] text-rose-500">Mi cuenta</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-950">Inicia sesion</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Accede para revisar pedidos, guardar tus datos y entrar al panel administrativo si tienes permisos.
                </p>
              </div>

              {showDemo ? (
                <div className="mt-6 space-y-3 text-sm text-slate-700">
                  {[
                    ["Admin", "admin@ninipijamas.ec", "Admin2026!"],
                    ["Cliente 1", "cliente@ninipijamas.ec", "Cliente2026!"],
                    ["Cliente 2", "cliente2@ninipijamas.ec", "Cliente2026!"]
                  ].map(([label, demoEmail, demoPassword]) => (
                    <div key={demoEmail} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">{label}</p>
                          <p className="mt-1 text-xs text-slate-600">{demoEmail}</p>
                          <p className="text-xs text-slate-600">{demoPassword}</p>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2">
                          <button type="button" onClick={() => copyToClipboard(demoEmail)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white">
                            Email
                          </button>
                          <button type="button" onClick={() => copyToClipboard(demoPassword)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white">
                            Pass
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </aside>

            <section className="p-8 sm:p-10">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Acceso</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-950">Entrar con tu correo</h2>
                <p className="mt-2 text-sm text-slate-600">Completa tus datos para continuar.</p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                <label className="block text-sm font-semibold text-slate-700">
                  Email
                  <div className="relative mt-2">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setFieldErrors((current) => ({ ...current, email: undefined }));
                      }}
                      className={`${inputClass(Boolean(fieldErrors.email))} pl-11`}
                      placeholder="correo@ejemplo.com"
                      aria-invalid={Boolean(fieldErrors.email)}
                    />
                  </div>
                  {fieldErrors.email ? <span className="mt-2 block text-xs text-rose-600">{fieldErrors.email}</span> : null}
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Contrasena
                  <div className="relative mt-2">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setFieldErrors((current) => ({ ...current, password: undefined }));
                      }}
                      className={`${inputClass(Boolean(fieldErrors.password))} px-11`}
                      placeholder="Tu contrasena"
                      aria-invalid={Boolean(fieldErrors.password)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.password ? <span className="mt-2 block text-xs text-rose-600">{fieldErrors.password}</span> : null}
                </label>

                {error ? <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
                >
                  {loading ? <LoadingSpinner /> : null}
                  {loading ? "Ingresando..." : "Entrar"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGoogleLoading(true);
                    window.location.href = `${apiUrl}/auth/google`;
                  }}
                  disabled={googleLoading}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {googleLoading ? <LoadingSpinner className="h-5 w-5 text-slate-700" /> : <img src="/google-icon.svg" alt="Google" className="h-5 w-5" />}
                  {googleLoading ? "Conectando..." : "Entrar con Google"}
                </button>
              </form>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Compra sin cuenta</p>
                <p className="mt-1">Puedes completar el checkout como invitado. La cuenta solo es necesaria para ver historial y gestionar permisos.</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
