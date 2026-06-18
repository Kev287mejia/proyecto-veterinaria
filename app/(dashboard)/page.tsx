import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import VetDashboard from '@/components/dashboard/VetDashboard';
import OwnerDashboard from '@/components/dashboard/OwnerDashboard';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Obtener el perfil del usuario desde la base de datos
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  // Nombre: preferir profile.full_name, luego user_metadata, luego fallback
  const displayName =
    profile?.full_name ||
    user!.user_metadata?.full_name ||
    user!.user_metadata?.name ||
    'Usuario';

  const roleName = profile?.role === 'vet' ? 'Veterinario / Clínica' : 'Dueño de Mascota';

  return (
    <>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg text-primary">
          Hola, {displayName}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Panel de Control ({roleName}) — Resumen de actividad para hoy.
        </p>
      </div>
      
      {profile?.role === 'vet' ? (
        <VetDashboard />
      ) : (
        <OwnerDashboard />
      )}
    </>
  );
}
