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

  // Nombre: preferir profile.full_name, luego user_metadata, luego parte del email
  const rawName =
    (profile?.full_name && profile.full_name.trim()) ||
    (user!.user_metadata?.full_name && String(user!.user_metadata.full_name).trim()) ||
    (user!.user_metadata?.name && String(user!.user_metadata.name).trim()) ||
    null;

  // Si no hay nombre, usa la parte antes del @ del email y capitaliza
  const displayName = rawName
    ? rawName
    : user!.email
      ? user!.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : 'Usuario';

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
