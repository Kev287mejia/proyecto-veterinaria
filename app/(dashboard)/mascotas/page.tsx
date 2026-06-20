import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import VetMascotas from '@/components/mascotas/VetMascotas';
import OwnerMascotas from '@/components/mascotas/OwnerMascotas';

export default async function MascotasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'vet') {
    return <VetMascotas userId={user.id} />;
  }

  return <OwnerMascotas userId={user.id} />;
}
