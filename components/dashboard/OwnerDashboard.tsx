import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

function calculateAge(birthDateStr: string | null): string {
  if (!birthDateStr) return 'Desconocida';
  const birth = new Date(birthDateStr);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years > 0) return `${years} año${years !== 1 ? 's' : ''}`;
  if (months > 0) return `${months} mes${months !== 1 ? 'es' : ''}`;
  return 'Menos de 1 mes';
}

export default async function OwnerDashboard({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: petsData } = await supabase.from('pets').select('*').eq('owner_id', userId).limit(3);
  const pets = petsData || [];

  const { data: apptsData } = await supabase.from('appointments')
    .select('id, appointment_date, reason, status, clinic:vet_clinics!vet_id(clinic_name), pet:pets(name)')
    .eq('owner_id', userId)
    .in('status', ['pending', 'confirmed'])
    .gte('appointment_date', new Date().toISOString())
    .order('appointment_date', { ascending: true })
    .limit(3);
  const appointments = apptsData || [];

  let upcomingVaccines: any[] = [];
  if (pets.length > 0) {
    const petIds = pets.map(p => p.id);
    const { data: vaxData } = await supabase
      .from('vaccines')
      .select('id, name, next_due_date, pet:pets(name)')
      .in('pet_id', petIds)
      .not('next_due_date', 'is', null)
      .order('next_due_date', { ascending: true })
      .limit(3);
    
    upcomingVaccines = vaxData || [];
  }
  return (
    <>
      {/* Mis Mascotas Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-title-md text-title-md text-primary">Mis Mascotas</h2>
          <Link 
            href="/mascotas"
            className="text-primary font-semibold text-body-sm hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Añadir Mascota
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {pets.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
              <p className="text-on-surface-variant mb-2">No tienes mascotas registradas.</p>
            </div>
          ) : (
            pets.map(pet => (
              <Link href={`/mascotas`} key={pet.id} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant hover:shadow-md transition-all group flex gap-4 items-center">
                <div className="w-16 h-16 rounded-full bg-surface-variant overflow-hidden border-2 border-primary-container shrink-0">
                  <img src={pet.avatar_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200&auto=format&fit=crop'} alt={pet.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-title-md text-title-md text-primary">{pet.name}</h3>
                  <p className="text-body-sm text-on-surface-variant">{pet.breed || pet.species} • {calculateAge(pet.birth_date)}</p>
                </div>
                <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </Link>
            ))
          )}
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
            {appointments.length === 0 ? (
              <div className="p-6 text-center bg-surface-container-low rounded-lg border border-dashed border-outline-variant">
                <p className="text-on-surface-variant text-sm">No tienes citas próximas agendadas.</p>
              </div>
            ) : (
              appointments.map(appt => {
                const date = new Date(appt.appointment_date);
                const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const [timeStr, period] = timeString.split(' ');
                
                return (
                  <div key={appt.id} className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${appt.status === 'confirmed' ? 'border-primary/30 bg-primary/5 hover:bg-primary/10' : 'border-outline-variant hover:bg-surface-container-low'}`}>
                    <div className="flex items-center gap-4">
                      <div className="bg-surface-container-lowest px-3 py-2 rounded-lg text-center shadow-sm min-w-[70px]">
                        <p className="text-[12px] text-on-surface-variant font-bold uppercase">{timeStr}</p>
                        <p className="text-[14px] font-bold text-primary">{period || 'H'}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${appt.status === 'confirmed' ? 'bg-secondary' : 'bg-surface-tint'}`}></span>
                          <p className="text-body-sm font-semibold">{appt.reason}</p>
                        </div>
                        <p className="text-[12px] text-on-surface-variant">Para <b>{(appt.pet as any)?.name}</b> en <i>{(appt.clinic as any)?.clinic_name}</i></p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {appt.status === 'confirmed' ? (
                        <span className="px-2 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded">Confirmada</span>
                      ) : (
                        <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded">Pendiente</span>
                      )}
                      <span className="text-[11px] text-on-surface-variant">{date.toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <Link 
            href="/citas"
            className="w-full mt-6 py-3 rounded-lg border border-outline-variant text-primary font-semibold text-sm hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
            Agendar nueva cita
          </Link>
        </div>
        
        {/* Recordatorios de Salud */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-title-md text-title-md text-primary">Recordatorios de Salud</h4>
          </div>
          
          <div className="relative space-y-6 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant">
            {upcomingVaccines.length === 0 ? (
              <div className="pl-9 py-2">
                <p className="text-body-sm text-on-surface-variant">No hay recordatorios de vacunas próximos.</p>
              </div>
            ) : (
              upcomingVaccines.map((vax) => {
                const dueDate = new Date(vax.next_due_date);
                const isOverdue = dueDate < new Date();
                
                // Calculate rough time string (e.g. "Venció hace 2 días", "En 2 semanas")
                const timeDiff = dueDate.getTime() - new Date().getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                let timeText = "";
                if (daysDiff < 0) {
                  timeText = `Venció hace ${Math.abs(daysDiff)} día${Math.abs(daysDiff) === 1 ? '' : 's'}`;
                } else if (daysDiff === 0) {
                  timeText = "Vence hoy";
                } else {
                  timeText = `En ${daysDiff} día${daysDiff === 1 ? '' : 's'}`;
                }

                return (
                  <div key={vax.id} className="relative flex gap-4 items-start pl-9">
                    <div className={`absolute left-0 top-1 w-9 h-9 rounded-full bg-surface border-2 flex items-center justify-center z-10 ${isOverdue ? 'border-error text-error' : 'border-secondary text-secondary'}`}>
                      <span className="material-symbols-outlined text-[18px]" data-icon="vaccines">vaccines</span>
                    </div>
                    <div>
                      <p className={`text-body-sm font-semibold ${isOverdue ? 'text-error' : 'text-on-surface'}`}>{vax.name}</p>
                      <p className="text-[12px] text-on-surface-variant">Próxima dosis para <b>{(vax.pet as any)?.name}</b>.</p>
                      <p className={`text-[11px] font-bold mt-1 ${isOverdue ? 'text-error' : 'text-on-surface-variant'}`}>{timeText}</p>
                    </div>
                  </div>
                );
              })
            )}
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
