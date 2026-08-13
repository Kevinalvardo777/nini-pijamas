import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 px-4 py-16 text-slate-300 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">NINI PIJAMAS</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Boutique de descanso femenino</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
            Diseños suaves, acabados premium y una experiencia de compra pensada para quienes buscan pijamas femeninas, cómodas y elegantes.
          </p>
        </div>
        <div className="grid gap-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Explorar</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/catalogo" className="text-slate-300 hover:text-white">Catálogo</Link>
              </li>
              <li>
                <Link href="/ofertas" className="text-slate-300 hover:text-white">Ofertas</Link>
              </li>
              <li>
                <Link href="/nuevos" className="text-slate-300 hover:text-white">Nuevos ingresos</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Contacto</p>
            <p className="mt-3 text-slate-300">hola@ninipijamas.ec</p>
            <p className="text-slate-300">WhatsApp: +593 979 543 962</p>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
        © 2026 NINI PIJAMAS. Boutique de pijamas premium.
      </div>
    </footer>
  );
}
