import LoadingSpinner from "../components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
          <img src="/nini-pijamas-logo.png" alt="Nini Pijamas" className="h-16 w-16 object-contain" />
          <LoadingSpinner className="h-6 w-6 text-rose-600" />
          <p className="text-sm font-semibold text-slate-700">Cargando Nini Pijamas...</p>
        </div>
      </div>
    </div>
  );
}
