import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import VetPetDetails from '@/components/mascotas/VetPetDetails';
import OwnerPetDetails from '@/components/mascotas/OwnerPetDetails';

// Note: In Next.js 15, `params` is a Promise, so it must be awaited before accessing properties like `params.id`.
export default async function PetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
    return <VetPetDetails petId={id} vetId={user.id} />;
  }

  return <OwnerPetDetails petId={id} />;
}
