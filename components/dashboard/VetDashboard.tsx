export default function VetDashboard() {
  return (
    <>
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary-container rounded-lg text-on-primary-container">
              <span className="material-symbols-outlined" data-icon="pets">pets</span>
            </div>
            <span className="text-on-secondary-container text-xs font-bold bg-secondary-container px-2 py-1 rounded-full">+4%</span>
          </div>
          <p className="text-on-surface-variant font-label-md text-label-md mb-1">Total de Mascotas</p>
          <h3 className="text-display-lg font-display-lg text-primary">1,248</h3>
        </div>
        
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-secondary-container rounded-lg text-on-secondary-container">
              <span className="material-symbols-outlined" data-icon="calendar_month">calendar_month</span>
            </div>
            <span className="text-on-surface-variant text-xs font-medium">Hoy</span>
          </div>
          <p className="text-on-surface-variant font-label-md text-label-md mb-1">Citas del día</p>
          <h3 className="text-display-lg font-display-lg text-primary">18</h3>
        </div>
        
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-surface-container-high rounded-lg text-primary">
              <span className="material-symbols-outlined" data-icon="stethoscope">stethoscope</span>
            </div>
            <span className="text-on-secondary-container text-xs font-bold bg-secondary-container px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-on-surface-variant font-label-md text-label-md mb-1">Consultas del Mes</p>
          <h3 className="text-display-lg font-display-lg text-primary">342</h3>
        </div>
        
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-error-container rounded-lg text-on-error-container">
              <span className="material-symbols-outlined" data-icon="vaccines">vaccines</span>
            </div>
            <span className="text-error font-bold text-xs">Urgente</span>
          </div>
          <p className="text-on-surface-variant font-label-md text-label-md mb-1">Vacunas Pendientes</p>
          <h3 className="text-display-lg font-display-lg text-primary">12</h3>
        </div>
      </div>
      
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Main Chart - Monthly Consultations */}
        <div className="lg:col-span-8 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-title-md text-title-md text-primary">Consultas Mensuales</h4>
            <select className="bg-surface-container-low border-none rounded-lg text-body-sm font-medium py-1.5 px-3 focus:ring-0">
              <option>Últimos 6 meses</option>
              <option>Este año</option>
            </select>
          </div>
          <div className="relative h-64 w-full flex items-end justify-between gap-2 pt-4 px-2">
            {/* Chart Bars */}
            <div className="flex flex-col items-center gap-2 w-full group">
              <div className="w-full bg-primary-container/20 rounded-t-md relative chart-bar hover:bg-primary-container/40 transition-colors cursor-pointer" style={{ height: "60%" }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[10px] px-2 py-1 rounded">210</div>
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium">Ene</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-full group">
              <div className="w-full bg-primary-container/20 rounded-t-md relative chart-bar hover:bg-primary-container/40 transition-colors cursor-pointer" style={{ height: "75%" }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[10px] px-2 py-1 rounded">280</div>
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium">Feb</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-full group">
              <div className="w-full bg-primary-container/20 rounded-t-md relative chart-bar hover:bg-primary-container/40 transition-colors cursor-pointer" style={{ height: "45%" }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[10px] px-2 py-1 rounded">160</div>
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium">Mar</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-full group">
              <div className="w-full bg-primary-container/20 rounded-t-md relative chart-bar hover:bg-primary-container/40 transition-colors cursor-pointer" style={{ height: "90%" }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[10px] px-2 py-1 rounded">310</div>
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium">Abr</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-full group">
              <div className="w-full bg-primary rounded-t-md relative chart-bar shadow-lg shadow-primary/20" style={{ height: "100%" }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-100 bg-primary text-white text-[10px] px-2 py-1 rounded">342</div>
              </div>
              <span className="text-[11px] text-primary font-bold">May</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-full group">
              <div className="w-full bg-outline-variant/30 rounded-t-md relative chart-bar" style={{ height: "20%" }}></div>
              <span className="text-[11px] text-on-surface-variant font-medium">Jun</span>
            </div>
          </div>
        </div>
        
        {/* Calendar Widget */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-title-md text-title-md text-primary">Mayo 2024</h4>
            <div className="flex gap-2">
              <button className="p-1 hover:bg-surface-container-low rounded-md transition-colors"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
              <button className="p-1 hover:bg-surface-container-low rounded-md transition-colors"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-y-3 text-center">
            <span className="text-[11px] font-bold text-on-surface-variant">LU</span>
            <span className="text-[11px] font-bold text-on-surface-variant">MA</span>
            <span className="text-[11px] font-bold text-on-surface-variant">MI</span>
            <span className="text-[11px] font-bold text-on-surface-variant">JU</span>
            <span className="text-[11px] font-bold text-on-surface-variant">VI</span>
            <span className="text-[11px] font-bold text-on-surface-variant">SA</span>
            <span className="text-[11px] font-bold text-on-surface-variant">DO</span>
            
            <span className="text-body-sm text-outline-variant">29</span>
            <span className="text-body-sm text-outline-variant">30</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">1</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">2</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">3</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">4</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">5</span>
            {/* Middle row clipped for brevity */}
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer relative">23<span className="absolute bottom-1 w-1 h-1 bg-secondary rounded-full"></span></span>
            <span className="text-body-sm bg-primary text-on-primary rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer font-bold ring-4 ring-primary/10">24</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">25</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">26</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer relative">27<span className="absolute bottom-1 w-1 h-1 bg-error rounded-full"></span></span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">28</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">29</span>
          </div>
          <div className="mt-6 pt-4 border-t border-outline-variant">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined" data-icon="event">event</span>
              </div>
              <div>
                <p className="text-body-sm font-semibold">Cita destacada</p>
                <p className="text-[11px] text-on-surface-variant">Max - Chequeo Anual @ 16:30</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Upcoming Consultations */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-title-md text-title-md text-primary">Próximas Consultas</h4>
            <button className="text-primary font-semibold text-body-sm hover:underline">Ver todas</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:border-primary/30 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="bg-surface-container-low px-3 py-1 rounded-md text-center">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase">10:30</p>
                  <p className="text-[12px] font-bold text-primary">AM</p>
                </div>
                <div>
                  <p className="text-body-sm font-semibold">Toby (Golden Retriever)</p>
                  <p className="text-[12px] text-on-surface-variant">Vacunación Sextuple - Juan Pérez</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <span className="px-2 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded">Confirmada</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-surface-container-low px-3 py-1 rounded-md text-center">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase">11:15</p>
                  <p className="text-[12px] font-bold text-primary">AM</p>
                </div>
                <div>
                  <p className="text-body-sm font-semibold">Luna (Gato Siamés)</p>
                  <p className="text-[12px] text-on-surface-variant">Limpieza Dental - María García</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded">Pendiente</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-surface-container-low px-3 py-1 rounded-md text-center">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase">12:00</p>
                  <p className="text-[12px] font-bold text-primary">PM</p>
                </div>
                <div>
                  <p className="text-body-sm font-semibold">Rocky (Bulldog Francés)</p>
                  <p className="text-[12px] text-on-surface-variant">Control Post-quirúrgico - Luis S.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <span className="px-2 py-1 bg-error-container text-on-error-container text-[10px] font-bold rounded">Urgente</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-title-md text-title-md text-primary">Actividad Reciente</h4>
          </div>
          <div className="relative space-y-6 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant">
            <div className="relative flex gap-4 items-start pl-9">
              <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-surface border-2 border-primary flex items-center justify-center z-10">
                <span className="material-symbols-outlined text-primary text-[18px]" data-icon="add_circle">add_circle</span>
              </div>
              <div>
                <p className="text-body-sm"><span className="font-bold text-primary">Dr. Ricardo</span> agregó un nuevo paciente: <span className="font-semibold italic">Coco</span>.</p>
                <p className="text-[11px] text-on-surface-variant">Hace 15 minutos</p>
              </div>
            </div>
            
            <div className="relative flex gap-4 items-start pl-9">
              <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-surface border-2 border-secondary flex items-center justify-center z-10">
                <span className="material-symbols-outlined text-secondary text-[18px]" data-icon="check_circle">check_circle</span>
              </div>
              <div>
                <p className="text-body-sm">Cita completada para <span className="font-semibold">Simba</span>. Reporte generado.</p>
                <p className="text-[11px] text-on-surface-variant">Hace 1 hora</p>
              </div>
            </div>
            
            <div className="relative flex gap-4 items-start pl-9">
              <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-surface border-2 border-outline-variant flex items-center justify-center z-10">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]" data-icon="history_edu">history_edu</span>
              </div>
              <div>
                <p className="text-body-sm">Actualización del historial clínico de <span className="font-semibold">Nala</span>.</p>
                <p className="text-[11px] text-on-surface-variant">Hace 3 horas</p>
              </div>
            </div>
            
            <div className="relative flex gap-4 items-start pl-9">
              <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-surface border-2 border-error flex items-center justify-center z-10">
                <span className="material-symbols-outlined text-error text-[18px]" data-icon="warning">warning</span>
              </div>
              <div>
                <p className="text-body-sm">Alerta: Stock bajo de <span className="font-semibold text-error">Vacuna Antirrábica</span>.</p>
                <p className="text-[11px] text-on-surface-variant">Hace 5 horas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 bg-primary text-on-primary w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-50 group">
        <span className="material-symbols-outlined text-[28px]">add</span>
        <span className="absolute right-full mr-4 bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Nueva Cita</span>
      </button>
    </>
  );
}
