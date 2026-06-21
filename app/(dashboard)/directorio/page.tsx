import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import MapViewer from '@/components/map/MapViewer';
import ClinicsDirectory from '@/components/directorio/ClinicsDirectory';

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

  // Fetch reviews for calculation
  const { data: reviews } = await supabase
    .from('reviews')
    .select('clinic_id, rating, comment, created_at, owner:profiles!owner_id(full_name)');

  const reviewsData = (reviews || []).map((rev: any) => {
    const ownerObj = Array.isArray(rev.owner) 
      ? (rev.owner[0] || null) 
      : (rev.owner || null);
    return {
      clinic_id: rev.clinic_id,
      rating: rev.rating,
      comment: rev.comment,
      created_at: rev.created_at,
      owner: ownerObj
    };
  });

  const clinicsWithRatings = (clinics || []).map((clinic) => {
    const clinicReviews = reviewsData.filter((r) => r.clinic_id === clinic.id);
    const count = clinicReviews.length;
    const avg = count > 0 ? Number((clinicReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)) : 0;
    return {
      ...clinic,
      avgRating: avg,
      reviewCount: count
    };
  });

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

      <MapViewer clinics={clinicsWithRatings} />

      <ClinicsDirectory clinics={clinicsWithRatings} reviews={reviewsData} />
    </div>
  );
}
