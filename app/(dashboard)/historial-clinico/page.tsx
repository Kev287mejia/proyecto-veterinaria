"use client";

import React from 'react';

export default function HistorialClinico() {
  return (
    <div className="space-y-8 pb-12">
      {/* Hero Pet Profile Section */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="relative">
          <img className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-surface shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDh3RPJU4gIUm9pyUSsKCkhbiufZL3IoPixbI5ikmffE3f1-KtJ0EW5Pvl0xMc6U81u-Dth6pof0qL7588KnFR3BCZw6n09WUD2rOzRgAwHfRaqF_3UnsAfriVgZctxlWyFFkTPN-_TjX-TK9D6JTf3u-GXKiEEtI0w5QH_tsHb8U4_sKPOV1w_3guIycedcunUXTVHBh-H_ngCAB6ziyIL8CIoKNS9e2oD_bTcWLHjpQeyYiI2ymHdf6ABCrjxRFbFBHQz7ARZQGY" alt="Bruno" />
          <div className="absolute -bottom-2 -right-2 bg-secondary text-on-secondary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-md">Activo</div>
        </div>
        <div className="flex-1 space-y-2 z-10">
          <div className="flex flex-wrap items-end gap-3">
            <h2 className="font-headline-lg text-3xl text-primary font-bold tracking-tight">Bruno</h2>
            <span className="font-title-md text-on-surface-variant mb-1 font-semibold">Golden Retriever</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="space-y-1">
              <p className="font-label-md text-on-surface-variant text-xs font-semibold uppercase tracking-wider">Edad</p>
              <p className="font-body-lg font-medium">4 años 2 meses</p>
            </div>
            <div className="space-y-1">
              <p className="font-label-md text-on-surface-variant text-xs font-semibold uppercase tracking-wider">Peso</p>
              <p className="font-body-lg font-medium">32.4 kg</p>
            </div>
            <div className="space-y-1">
              <p className="font-label-md text-on-surface-variant text-xs font-semibold uppercase tracking-wider">Sexo</p>
              <div className="flex items-center gap-1 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[18px]">male</span>
                <p className="font-body-lg font-medium">Macho</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-label-md text-on-surface-variant text-xs font-semibold uppercase tracking-wider">Dueño</p>
              <p className="font-body-lg font-medium text-primary hover:underline cursor-pointer">Mariana S. García</p>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <span className="px-3 py-1 bg-error-container text-on-error-container rounded-full text-[11px] flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              Alergia: Penicilina
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto z-10">
          <button className="w-full px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-sm active:scale-95">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nueva Consulta
          </button>
          <button className="w-full px-6 py-2.5 border border-outline-variant text-on-surface-variant rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-surface-container-low transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]">print</span>
            Exportar PDF
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Timeline - Left Column */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-primary">Historial de Eventos</h3>
            <span className="text-sm font-medium text-on-surface-variant">3 entradas</span>
          </div>
          <div className="relative space-y-8 pl-4 mt-2">
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-outline-variant/50"></div>
            
            <div className="relative group cursor-pointer">
              <div className="absolute -left-[13px] top-1.5 w-4 h-4 rounded-full bg-primary ring-4 ring-background z-10"></div>
              <div className="p-4 bg-surface-container border border-primary rounded-xl space-y-1 shadow-sm transition-transform hover:scale-[1.02]">
                <span className="text-xs text-primary font-bold tracking-wider">12 OCT 2023 • HOY</span>
                <p className="text-sm font-bold text-on-surface mt-1">Chequeo General / Síntomas GI</p>
                <p className="text-xs text-on-surface-variant font-medium">Dr. Alejandro Ruiz</p>
              </div>
            </div>

            <div className="relative group cursor-pointer">
              <div className="absolute -left-[13px] top-1.5 w-4 h-4 rounded-full bg-outline-variant ring-4 ring-background group-hover:bg-primary transition-colors z-10"></div>
              <div className="p-4 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/50 hover:border-outline-variant rounded-xl transition-all space-y-1">
                <span className="text-xs text-on-surface-variant font-bold tracking-wider">24 AGO 2023</span>
                <p className="text-sm font-bold text-on-surface mt-1">Vacunación Cuádruple</p>
                <p className="text-xs text-on-surface-variant font-medium">Dra. Clara Méndez</p>
              </div>
            </div>

            <div className="relative group cursor-pointer">
              <div className="absolute -left-[13px] top-1.5 w-4 h-4 rounded-full bg-outline-variant ring-4 ring-background group-hover:bg-primary transition-colors z-10"></div>
              <div className="p-4 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/50 hover:border-outline-variant rounded-xl transition-all space-y-1">
                <span className="text-xs text-on-surface-variant font-bold tracking-wider">15 MAY 2023</span>
                <p className="text-sm font-bold text-on-surface mt-1">Limpieza Dental</p>
                <p className="text-xs text-on-surface-variant font-medium">Dr. Alejandro Ruiz</p>
              </div>
            </div>
            
          </div>
        </aside>

        {/* Detailed Record - Right Column */}
        <section className="lg:col-span-8 space-y-6">
          <article className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-surface-container p-6 flex justify-between items-center border-b border-outline-variant">
              <div>
                <h3 className="text-xl font-bold text-primary">Detalle de la Consulta</h3>
                <p className="text-xs text-on-surface-variant font-medium mt-1 tracking-wide">ID: #VC-29012 • 12 de Octubre, 2023</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-primary-container text-on-primary-container rounded-full text-xs font-bold tracking-wide">Consulta General</span>
              </div>
            </div>
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Motivo / Síntomas</label>
                    <p className="text-sm text-on-surface bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 leading-relaxed font-medium">
                      El paciente presenta apatía, inapetencia desde hace 24 horas y un episodio de vómito bilioso por la mañana. Posible ingesta de objeto extraño.
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Diagnóstico</label>
                    <p className="text-sm font-bold text-primary bg-primary/10 p-4 rounded-xl border border-primary/20">
                      Gastroenteritis inespecífica vs. Cuerpo extraño gástrico.
                    </p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Veterinario Tratante</label>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-on-surface">Dr. Alejandro Ruiz (Colegiado #2819)</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Constantes Vitales</label>
                    <div className="flex flex-wrap gap-2">
                      <div className="px-3 py-1.5 bg-surface-container-high rounded-lg text-xs font-bold"><span className="text-on-surface-variant mr-1 font-semibold">T:</span> 38.5°C</div>
                      <div className="px-3 py-1.5 bg-surface-container-high rounded-lg text-xs font-bold"><span className="text-on-surface-variant mr-1 font-semibold">FC:</span> 82 lpm</div>
                      <div className="px-3 py-1.5 bg-surface-container-high rounded-lg text-xs font-bold"><span className="text-on-surface-variant mr-1 font-semibold">FR:</span> 24 rpm</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-outline-variant/60 pt-6 space-y-4">
                <h4 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">medication</span>
                  Plan de Tratamiento y Medicación
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 border border-outline-variant/60 rounded-xl bg-surface-container-lowest shadow-sm">
                    <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-3">Prescripción</p>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-secondary shrink-0"></div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">Cerenia 16mg</p>
                          <p className="text-xs text-on-surface-variant font-medium mt-0.5">1 tableta cada 24 horas por 3 días (Antiemético)</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-secondary shrink-0"></div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">Dieta Blanda (I/D)</p>
                          <p className="text-xs text-on-surface-variant font-medium mt-0.5">Fraccionar en 4 tomas diarias por 48 horas.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="p-5 border border-outline-variant/60 rounded-xl bg-surface-container-lowest shadow-sm">
                    <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-3">Instrucciones</p>
                    <p className="text-sm text-on-surface leading-relaxed italic font-medium">
                      "Mantener en observación estricta. Si el vómito persiste a pesar de la medicación o si aparece sangre en heces, acudir a urgencias de inmediato para ecografía abdominal."
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-container-low p-4 px-6 flex justify-between items-center border-t border-outline-variant">
              <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">history</span> Editado hace 2 horas</span>
              <div className="flex gap-3 ml-auto">
                <button className="px-5 py-2 border border-outline-variant rounded-xl text-sm font-bold hover:bg-white transition-all active:scale-95 shadow-sm">Editar Nota</button>
                <button className="px-5 py-2 bg-secondary text-on-secondary rounded-xl text-sm font-bold hover:bg-secondary-fixed-dim transition-all active:scale-95 shadow-sm">Enviar a Cliente</button>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
