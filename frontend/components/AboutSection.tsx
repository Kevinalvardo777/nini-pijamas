export default function AboutSection() {
  return (
    <section id="quienes-somos" className="relative overflow-hidden rounded-[2rem] bg-slate-100/95 px-6 py-12 text-slate-900 shadow-[0_30px_90px_rgba(15,23,42,0.12)] sm:px-10 sm:py-16">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-rose-100 to-transparent" />
      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Quiénes somos</p>
            <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Diseño boutique para tus noches más suaves.
            </h2>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              En nini_pijamas creamos pijamas femeninas que combinan telas suaves, cortes elegantes y acabados cuidadosamente pensados.
              Cada colección es una invitación a descansar con estilo y sentirse especial dentro y fuera de casa.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-slate-950">Suavidad boutique</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Telas delicadas y acabados femeninos que envuelven tus noches con confort premium.
              </p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-slate-950">Atención personalizada</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Asesoría en tallas, colores y detalles para que encuentres justo la pijama perfecta.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              <h4 className="text-sm uppercase tracking-[0.28em] text-rose-500">Colecciones</h4>
              <p className="mt-3 text-sm leading-7 text-slate-600">Estampados exclusivos, siluetas modernas y una paleta suave pensada para la noche.</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              <h4 className="text-sm uppercase tracking-[0.28em] text-rose-500">Regalos con estilo</h4>
              <p className="mt-3 text-sm leading-7 text-slate-600">Paquetes boutique listos para entregar, ideales para quienes quieren regalar comodidad.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
            <img src="/pijama6.png" alt="Nicole Bozada, fundadora de Nini Pijamas" className="h-96 w-full object-cover object-top" />
            <div className="border-t border-slate-200 bg-slate-50 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Nicole Bozada</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950">Fundadora y creadora de Nini Pijamas</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Nicole lidera cada colección con una visión boutique y un cariño especial por la comodidad y el diseño femenino.
                Su estilo es la inspiración detrás de nuestras pijamas suaves y elegantes.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              <p className="text-sm uppercase tracking-[0.28em] text-rose-500">Nuestra esencia</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Transmitimos confianza y elegancia en cada pijama, con un estilo boutique pensado para mujeres que valoran el descanso.
              </p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              <p className="text-sm uppercase tracking-[0.28em] text-rose-500">Experiencia boutique</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Compra fácil, envío seguro y una colección diseñada para regalar sensaciones de calma y lujo discreto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
