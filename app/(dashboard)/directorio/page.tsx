import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import MapViewer from '@/components/map/MapViewer';
import Link from 'next/link';

export default async function DirectorioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch clinics
  const { data: clinics, error } = await supabase
    .from('vet_clinics')
    .select('*');

  if (error) {
    console.error("Error fetching clinics:", error);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline-lg text-[28px] md:text-[36px] text-primary tracking-tight font-extrabold flex items-center gap-3">
            <span className="p-2 bg-primary-container text-primary rounded-2xl">
              <span className="material-symbols-outlined text-[32px]">location_on</span>
            </span>
            Directorio de Clínicas
          </h2>
          <p className="text-on-surface-variant font-body-lg text-sm md:text-base mt-2 max-w-2xl">
            Encuentra las clínicas y farmacias veterinarias en Puerto Cabezas (Bilwi). 
            Explora el mapa interactivo y localiza la mejor opción cerca de ti gracias a las direcciones por referencias.
          </p>
        </div>
      </div>

      <MapViewer clinics={clinics || []} />

      {/* Listado Rápido */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-primary mb-6">Listado de Clínicas Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(clinics || []).map((clinic) => (
            <div key={clinic.id} className="bg-surface-container-lowest border border-outline-variant/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-primary">local_hospital</span>
              </div>
              <h4 className="text-lg font-bold text-on-surface mb-1">{clinic.clinic_name}</h4>
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-4">{clinic.city}</p>
              
              <div className="flex gap-2 items-start text-sm text-on-surface-variant mb-4">
                <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">location_on</span>
                <p className="font-medium">{clinic.address}</p>
              </div>

              <Link 
                href={`/citas?clinicId=${clinic.id}`}
                className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
              >
                Solicitar Cita <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          ))}

          {(!clinics || clinics.length === 0) && (
            <div className="col-span-full bg-surface-container-low rounded-3xl p-8 text-center text-on-surface-variant">
              No hay clínicas registradas en el sistema en este momento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
