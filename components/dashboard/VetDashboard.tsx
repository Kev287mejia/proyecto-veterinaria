import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins === 1 ? '' : 's'}`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours === 1 ? '' : 's'}`;
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} día${diffDays === 1 ? '' : 's'}`;
}

export default async function VetDashboard({ userId }: { userId: string }) {
  const supabase = await createClient();

  // 1. Obtener clínicas asociadas al veterinario conectado
  const { data: clinics } = await supabase
    .from('vet_clinics')
    .select('id, clinic_name')
    .eq('owner_id', userId);
  
  const clinicIds = clinics?.map(c => c.id) || [];

  // Variables de estadísticas (inicializadas en 0)
  let totalPets = 0;
  let todayCitasCount = 0;
  let consultasMesCount = 0;
  let pendingVaxCount = 0;
  let upcomingConsultations: any[] = [];
  let recentActivities: any[] = [];

  // Estructura del gráfico mensual (últimos 6 meses)
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const chartData: any[] = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    chartData.push({
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      name: monthNames[d.getMonth()],
      count: 0
    });
  }

  if (clinicIds.length > 0) {
    // 2. Total de Mascotas Únicas
    const { data: apptsPets } = await supabase
      .from('appointments')
      .select('pet_id')
      .in('vet_id', clinicIds);
    
    const { data: recordsPets } = await supabase
      .from('medical_records')
      .select('pet_id')
      .in('vet_id', clinicIds);
    
    const uniquePets = new Set([
      ...(apptsPets || []).map(p => p.pet_id),
      ...(recordsPets || []).map(r => r.pet_id)
    ].filter(Boolean));
    totalPets = uniquePets.size;

    // 3. Citas del Día (Hoy)
    const todayStr = now.toISOString().split('T')[0];
    const startOfToday = `${todayStr}T00:00:00.000Z`;
    const endOfToday = `${todayStr}T23:59:59.999Z`;

    const { count: citasToday } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .in('vet_id', clinicIds)
      .gte('appointment_date', startOfToday)
      .lte('appointment_date', endOfToday);
    todayCitasCount = citasToday || 0;

    // 4. Consultas del Mes
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: consultasMes } = await supabase
      .from('medical_records')
      .select('*', { count: 'exact', head: true })
      .in('vet_id', clinicIds)
      .gte('visit_date', startOfMonth.toISOString());
    consultasMesCount = consultasMes || 0;

    // 5. Vacunas Pendientes (Vencidas)
    const { count: pendingVax } = await supabase
      .from('vaccines')
      .select('*', { count: 'exact', head: true })
      .in('vet_id', clinicIds)
      .lt('next_due_date', todayStr);
    pendingVaxCount = pendingVax || 0;

    // 6. Cargar datos del gráfico (consultas de los últimos 6 meses)
    const startDateForChart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    startDateForChart.setHours(0, 0, 0, 0);
    
    const { data: chartRecords } = await supabase
      .from('medical_records')
      .select('visit_date')
      .in('vet_id', clinicIds)
      .gte('visit_date', startDateForChart.toISOString());
    
    if (chartRecords) {
      chartRecords.forEach(r => {
        const date = new Date(r.visit_date);
        const item = chartData.find(c => c.monthIndex === date.getMonth() && c.year === date.getFullYear());
        if (item) {
          item.count++;
        }
      });
    }

    // 7. Próximas Consultas (Lista)
    const { data: upcomingAppts } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        reason,
        status,
        pet:pets(id, name, breed, species),
        owner:profiles!owner_id(full_name)
      `)
      .in('vet_id', clinicIds)
      .in('status', ['pending', 'confirmed'])
      .gte('appointment_date', now.toISOString())
      .order('appointment_date', { ascending: true })
      .limit(3);
    upcomingConsultations = upcomingAppts || [];

    // 8. Actividad Reciente Dinámica
    const { data: recentRecords } = await supabase
      .from('medical_records')
      .select('id, created_at, diagnosis, pet:pets(name)')
      .in('vet_id', clinicIds)
      .order('created_at', { ascending: false })
      .limit(2);

    const { data: recentAppts } = await supabase
      .from('appointments')
      .select('id, created_at, reason, pet:pets(name), status')
      .in('vet_id', clinicIds)
      .order('created_at', { ascending: false })
      .limit(2);

    const activities: any[] = [];

    if (recentRecords) {
      recentRecords.forEach(r => {
        const petObj = Array.isArray(r.pet) ? r.pet[0] : r.pet;
        const petName = (petObj as any)?.name;
        activities.push({
          title: `Reporte clínico generado para ${petName || 'Mascota'}.`,
          description: `Diagnóstico: ${r.diagnosis}`,
          date: new Date(r.created_at),
          icon: 'history_edu'
        });
      });
    }

    if (recentAppts) {
      recentAppts.forEach(a => {
        const petObj = Array.isArray(a.pet) ? a.pet[0] : a.pet;
        const petName = (petObj as any)?.name;
        if (a.status === 'completed') {
          activities.push({
            title: `Cita completada para ${petName || 'Mascota'}.`,
            description: `Motivo: ${a.reason}`,
            date: new Date(a.created_at),
            icon: 'check_circle'
          });
        } else {
          activities.push({
            title: `Nueva cita solicitada para ${petName || 'Mascota'}.`,
            description: `Motivo: ${a.reason} (${a.status === 'confirmed' ? 'Confirmada' : 'Pendiente'})`,
            date: new Date(a.created_at),
            icon: 'add_circle'
          });
        }
      });
    }

    activities.sort((a, b) => b.date.getTime() - a.date.getTime());
    recentActivities = activities.slice(0, 4);
  }

  const maxCount = Math.max(...chartData.map(c => c.count), 1);

  return (
    <>
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary-container rounded-lg text-on-primary-container">
              <span className="material-symbols-outlined" data-icon="pets">pets</span>
            </div>
            <span className="text-on-secondary-container text-xs font-bold bg-secondary-container px-2 py-1 rounded-full">Activo</span>
          </div>
          <p className="text-on-surface-variant font-label-md text-label-md mb-1">Total de Mascotas</p>
          <h3 className="text-display-lg font-display-lg text-primary">{totalPets}</h3>
        </div>
        
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-secondary-container rounded-lg text-on-secondary-container">
              <span className="material-symbols-outlined" data-icon="calendar_month">calendar_month</span>
            </div>
            <span className="text-on-surface-variant text-xs font-medium">Hoy</span>
          </div>
          <p className="text-on-surface-variant font-label-md text-label-md mb-1">Citas del día</p>
          <h3 className="text-display-lg font-display-lg text-primary">{todayCitasCount}</h3>
        </div>
        
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-surface-container-high rounded-lg text-primary">
              <span className="material-symbols-outlined" data-icon="stethoscope">stethoscope</span>
            </div>
            <span className="text-on-secondary-container text-xs font-bold bg-secondary-container px-2 py-1 rounded-full">Este Mes</span>
          </div>
          <p className="text-on-surface-variant font-label-md text-label-md mb-1">Consultas del Mes</p>
          <h3 className="text-display-lg font-display-lg text-primary">{consultasMesCount}</h3>
        </div>
        
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-error-container rounded-lg text-on-error-container">
              <span className="material-symbols-outlined" data-icon="vaccines">vaccines</span>
            </div>
            <span className={`font-bold text-xs ${pendingVaxCount > 0 ? 'text-error animate-pulse' : 'text-on-surface-variant'}`}>
              {pendingVaxCount > 0 ? 'Revisar' : 'Al día'}
            </span>
          </div>
          <p className="text-on-surface-variant font-label-md text-label-md mb-1">Vacunas Vencidas</p>
          <h3 className="text-display-lg font-display-lg text-primary">{pendingVaxCount}</h3>
        </div>
      </div>
      
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Main Chart - Monthly Consultations */}
        <div className="lg:col-span-8 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-title-md text-title-md text-primary">Consultas Mensuales</h4>
            <span className="bg-surface-container-low rounded-lg text-body-sm font-medium py-1.5 px-3">
              Últimos 6 meses
            </span>
          </div>
          <div className="relative h-64 w-full flex items-end justify-between gap-2 pt-4 px-2">
            {chartData.map((item, idx) => {
              const isCurrentMonth = item.monthIndex === now.getMonth() && item.year === now.getFullYear();
              const percent = (item.count / maxCount) * 100;
              return (
                <div key={idx} className="flex flex-col items-center gap-2 w-full group">
                  <div 
                    className={`w-full rounded-t-md relative chart-bar hover:bg-primary-container/40 transition-colors cursor-pointer ${
                      isCurrentMonth ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-primary-container/20'
                    }`} 
                    style={{ height: `${percent > 10 ? percent : 10}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[10px] px-2 py-1 rounded z-10">
                      {item.count}
                    </div>
                  </div>
                  <span className={`text-[11px] font-medium ${isCurrentMonth ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Calendar Widget */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-title-md text-title-md text-primary">
              {now.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
            </h4>
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
            
            <span className="text-body-sm text-outline-variant">25</span>
            <span className="text-body-sm text-outline-variant">26</span>
            <span className="text-body-sm text-outline-variant">27</span>
            <span className="text-body-sm text-outline-variant">28</span>
            <span className="text-body-sm text-outline-variant">29</span>
            <span className="text-body-sm text-outline-variant">30</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">1</span>
            
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">2</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">3</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">4</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">5</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">6</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">7</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">8</span>
            
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">9</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">10</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">11</span>
            <span className="text-body-sm bg-primary text-on-primary rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer font-bold ring-4 ring-primary/10">{now.getDate()}</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">13</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">14</span>
            <span className="text-body-sm hover:bg-surface-container-low rounded-full w-8 h-8 flex items-center justify-center mx-auto cursor-pointer">15</span>
          </div>
          <div className="mt-6 pt-4 border-t border-outline-variant">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined" data-icon="event">event</span>
              </div>
              <div>
                <p className="text-body-sm font-semibold">Cita Destacada Hoy</p>
                <p className="text-[11px] text-on-surface-variant">
                  {upcomingConsultations[0] 
                    ? `${(Array.isArray(upcomingConsultations[0].pet) ? upcomingConsultations[0].pet[0] : upcomingConsultations[0].pet as any)?.name || 'Paciente'} - ${upcomingConsultations[0].reason} @ ${new Date(upcomingConsultations[0].appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` 
                    : 'Sin citas próximas'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Upcoming Consultations */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-title-md text-title-md text-primary">Próximas Consultas</h4>
            <Link href="/citas" className="text-primary font-semibold text-body-sm hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-4">
            {upcomingConsultations.length === 0 ? (
              <div className="p-6 text-center bg-surface-container-low rounded-lg border border-dashed border-outline-variant">
                <p className="text-on-surface-variant text-sm">No hay consultas próximas agendadas.</p>
              </div>
            ) : (
              upcomingConsultations.map((appt) => {
                const dateObj = new Date(appt.appointment_date);
                const timeString = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                const ampm = dateObj.getHours() >= 12 ? 'PM' : 'AM';
                return (
                  <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:border-primary/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="bg-surface-container-low px-3 py-1 rounded-md text-center min-w-[60px]">
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase">{timeString}</p>
                        <p className="text-[12px] font-bold text-primary">{ampm}</p>
                      </div>
                      <div>
                        <p className="text-body-sm font-semibold">
                          {(Array.isArray(appt.pet) ? appt.pet[0] : appt.pet as any)?.name || 'Paciente'} (
                          {(Array.isArray(appt.pet) ? appt.pet[0] : appt.pet as any)?.breed || (Array.isArray(appt.pet) ? appt.pet[0] : appt.pet as any)?.species || 'Sin raza'})
                        </p>
                        <p className="text-[12px] text-on-surface-variant">{appt.reason} - {appt.owner?.full_name || 'Dueño'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Link href="/citas" className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </Link>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        appt.status === 'confirmed' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {appt.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-title-md text-title-md text-primary">Actividad Reciente</h4>
          </div>
          <div className="relative space-y-6 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant">
            {recentActivities.length === 0 ? (
              <div className="pl-9 py-2">
                <p className="text-body-sm text-on-surface-variant">No hay actividad reciente registrada.</p>
              </div>
            ) : (
              recentActivities.map((act, index) => {
                const relativeTime = getRelativeTime(act.date);
                return (
                  <div key={index} className="relative flex gap-4 items-start pl-9">
                    <div className={`absolute left-0 top-1 w-9 h-9 rounded-full bg-surface border-2 ${
                      act.icon === 'add_circle' ? 'border-primary' : act.icon === 'check_circle' ? 'border-secondary' : 'border-outline-variant'
                    } flex items-center justify-center z-10`}>
                      <span className={`material-symbols-outlined text-[18px] ${
                        act.icon === 'add_circle' ? 'text-primary' : act.icon === 'check_circle' ? 'text-secondary' : 'text-on-surface-variant'
                      }`}>{act.icon}</span>
                    </div>
                    <div>
                      <p className="text-body-sm">{act.title}</p>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">{act.description}</p>
                      <p className="text-[11px] text-on-surface-variant font-bold mt-1">{relativeTime}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <Link href="/citas" className="fixed bottom-8 right-8 bg-primary text-on-primary w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-50 group">
        <span className="material-symbols-outlined text-[28px]">add</span>
        <span className="absolute right-full mr-4 bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Nueva Cita</span>
      </Link>
    </>
  );
}
