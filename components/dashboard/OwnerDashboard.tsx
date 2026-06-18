import Link from 'next/link';

export default function OwnerDashboard() {
  return (
    <>
      {/* Mis Mascotas Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-title-md text-title-md text-primary">Mis Mascotas</h2>
          <button className="text-primary font-semibold text-body-sm hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Añadir Mascota
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {/* Pet Card 1 */}
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant hover:shadow-md transition-all group flex gap-4 items-center">
            <div className="w-16 h-16 rounded-full bg-surface-variant overflow-hidden border-2 border-primary-container shrink-0">
              <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200&auto=format&fit=crop" alt="Beagle" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-title-md text-title-md text-primary">Max</h3>
              <p className="text-body-sm text-on-surface-variant">Beagle • 3 años</p>
            </div>
            <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          
          {/* Pet Card 2 */}
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant hover:shadow-md transition-all group flex gap-4 items-center">
            <div className="w-16 h-16 rounded-full bg-surface-variant overflow-hidden border-2 border-secondary-container shrink-0">
              <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=200&auto=format&fit=crop" alt="Gato Siamés" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-title-md text-title-md text-primary">Luna</h3>
              <p className="text-body-sm text-on-surface-variant">Siamés • 1 año</p>
            </div>
            <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Bento Grid Layout for Owner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Próximas Citas */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-title-md text-title-md text-primary">Próximas Citas</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-surface-container-lowest px-3 py-2 rounded-lg text-center shadow-sm">
                  <p className="text-[12px] text-on-surface-variant font-bold uppercase">10:30</p>
                  <p className="text-[14px] font-bold text-primary">AM</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <p className="text-body-sm font-semibold">Vacunación Múltiple</p>
                  </div>
                  <p className="text-[12px] text-on-surface-variant">Para <b>Max</b> en <i>Clínica VetSalud</i></p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="px-2 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded">Confirmada</span>
                <span className="text-[11px] text-on-surface-variant">Mañana</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-surface-container-low px-3 py-2 rounded-lg text-center">
                  <p className="text-[12px] text-on-surface-variant font-bold uppercase">16:00</p>
                  <p className="text-[14px] font-bold text-primary">PM</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-surface-tint"></span>
                    <p className="text-body-sm font-semibold">Corte de uñas y baño</p>
                  </div>
                  <p className="text-[12px] text-on-surface-variant">Para <b>Luna</b> en <i>PetSpa Centro</i></p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[11px] font-medium text-primary">Ver detalles</span>
                <span className="text-[11px] text-on-surface-variant">En 5 días</span>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-6 py-3 rounded-lg border border-outline-variant text-primary font-semibold text-sm hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
            Agendar nueva cita
          </button>
        </div>
        
        {/* Recordatorios de Salud */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-title-md text-title-md text-primary">Recordatorios de Salud</h4>
          </div>
          <div className="relative space-y-6 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant">
            
            <div className="relative flex gap-4 items-start pl-9">
              <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-surface border-2 border-error flex items-center justify-center z-10">
                <span className="material-symbols-outlined text-error text-[18px]" data-icon="vaccines">vaccines</span>
              </div>
              <div>
                <p className="text-body-sm font-semibold text-error">Vacuna Antirrábica</p>
                <p className="text-[12px] text-on-surface-variant">Max necesita su refuerzo anual.</p>
                <p className="text-[11px] font-bold text-error mt-1">Venció hace 2 días</p>
              </div>
            </div>
            
            <div className="relative flex gap-4 items-start pl-9">
              <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-surface border-2 border-secondary flex items-center justify-center z-10">
                <span className="material-symbols-outlined text-secondary text-[18px]" data-icon="medication">medication</span>
              </div>
              <div>
                <p className="text-body-sm font-semibold">Desparasitación</p>
                <p className="text-[12px] text-on-surface-variant">Próxima dosis para Luna.</p>
                <p className="text-[11px] font-medium text-on-surface-variant mt-1">En 2 semanas</p>
              </div>
            </div>

          </div>
        </div>
        
        {/* Acceso Rápido / Servicios */}
        <div className="lg:col-span-12 mt-4">
          <h4 className="font-title-md text-title-md text-primary mb-4">Descubre Servicios</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="#" className="bg-primary/10 hover:bg-primary/20 transition-colors p-4 rounded-xl flex flex-col items-center justify-center gap-3 border border-primary/20 text-center">
              <span className="material-symbols-outlined text-primary text-3xl">local_hospital</span>
              <span className="text-sm font-semibold text-primary">Directorio Clínico</span>
            </Link>
            <Link href="#" className="bg-secondary/10 hover:bg-secondary/20 transition-colors p-4 rounded-xl flex flex-col items-center justify-center gap-3 border border-secondary/20 text-center">
              <span className="material-symbols-outlined text-secondary text-3xl">storefront</span>
              <span className="text-sm font-semibold text-secondary">Tienda de Productos</span>
            </Link>
            <Link href="#" className="bg-error/10 hover:bg-error/20 transition-colors p-4 rounded-xl flex flex-col items-center justify-center gap-3 border border-error/20 text-center">
              <span className="material-symbols-outlined text-error text-3xl">emergency</span>
              <span className="text-sm font-semibold text-error">Urgencias 24/7</span>
            </Link>
            <Link href="#" className="bg-surface-tint/10 hover:bg-surface-tint/20 transition-colors p-4 rounded-xl flex flex-col items-center justify-center gap-3 border border-surface-tint/20 text-center">
              <span className="material-symbols-outlined text-surface-tint text-3xl">content_cut</span>
              <span className="text-sm font-semibold text-surface-tint">Estética y Baño</span>
            </Link>
          </div>
        </div>
        
      </div>
    </>
  );
}
