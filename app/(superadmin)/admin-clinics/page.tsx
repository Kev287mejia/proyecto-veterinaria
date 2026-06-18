"use client";

export default function AdminClinics() {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-[#1e293b] p-6 rounded-3xl border border-slate-700/50 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl text-emerald-400">domain</span>
            Gestión de Clínicas
          </h2>
          <p className="text-slate-400 mt-1">Próximamente: Administración de sucursales y licencias de clínicas veterinarias.</p>
        </div>
      </div>

      <div className="bg-[#1e293b] border border-slate-700/50 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">construction</span>
        <h3 className="text-xl font-bold text-slate-300">Módulo en Construcción</h3>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          En futuras actualizaciones de Vetsync, este módulo te permitirá gestionar suscripciones, licencias y sucursales específicas de las clínicas registradas.
        </p>
      </div>
    </div>
  );
}
