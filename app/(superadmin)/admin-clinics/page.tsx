"use client";

export default function AdminClinics() {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/50 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl text-tertiary">domain</span>
            Gestión de Clínicas
          </h2>
          <p className="text-on-surface-variant mt-1">Próximamente: Administración de sucursales y licencias de clínicas veterinarias.</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-sm">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">construction</span>
        <h3 className="text-xl font-bold text-on-surface">Módulo en Construcción</h3>
        <p className="text-on-surface-variant mt-2 max-w-md mx-auto">
          En futuras actualizaciones de Vetsync, este módulo te permitirá gestionar suscripciones, licencias y sucursales específicas de las clínicas registradas.
        </p>
      </div>
    </div>
  );
}
