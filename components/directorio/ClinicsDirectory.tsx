"use client";

import { useState } from 'react';
import Link from 'next/link';

interface Clinic {
  id: string;
  clinic_name: string;
  address: string;
  city: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  avgRating?: number;
  reviewCount?: number;
}

interface Review {
  clinic_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  owner: {
    full_name: string;
  } | null;
}

interface ClinicsDirectoryProps {
  clinics: Clinic[];
  reviews: Review[];
}

export default function ClinicsDirectory({ clinics, reviews }: ClinicsDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  // Filter clinics
  const filteredClinics = clinics.filter((clinic) => {
    const matchesSearch = clinic.clinic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          clinic.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'all' || clinic.city.toLowerCase() === selectedCity.toLowerCase();
    return matchesSearch && matchesCity;
  });

  // Unique cities list
  const cities = Array.from(new Set(clinics.map((c) => c.city))).filter(Boolean);

  // Get reviews of selected clinic
  const clinicReviews = selectedClinic
    ? reviews.filter((r) => r.clinic_id === selectedClinic.id)
    : [];

  // Calculate rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = clinicReviews.filter((r) => r.rating === stars).length;
    const percentage = clinicReviews.length > 0 ? (count / clinicReviews.length) * 100 : 0;
    return { stars, count, percentage };
  });

  // Get user initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="mt-12 space-y-6">
      {/* Search & Filter bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-container-lowest border border-outline-variant/60 p-4 rounded-3xl shadow-sm">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">search</span>
          Buscar Clínicas
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por nombre o dirección..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 rounded-xl border border-outline-variant/80 bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm text-on-surface"
          />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full sm:w-48 px-4 py-2 rounded-xl border border-outline-variant/80 bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm text-on-surface cursor-pointer"
          >
            <option value="all">Todas las ciudades</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Clinics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClinics.map((clinic) => (
          <div
            key={clinic.id}
            onClick={() => setSelectedClinic(clinic)}
            className="bg-surface-container-lowest border border-outline-variant/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[220px]"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-primary">local_hospital</span>
            </div>
            <div>
              <div className="flex justify-between items-start gap-4 mb-2">
                <h4 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">{clinic.clinic_name}</h4>
              </div>
              
              {/* Rating stars */}
              <div className="flex items-center gap-1.5 mb-3">
                {clinic.reviewCount && clinic.reviewCount > 0 ? (
                  <>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`material-symbols-outlined text-[16px]`}
                          style={{ fontVariationSettings: star <= Math.round(clinic.avgRating || 0) ? "'FILL' 1" : undefined }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-on-surface">{clinic.avgRating}</span>
                    <span className="text-xs text-on-surface-variant font-medium">({clinic.reviewCount} {clinic.reviewCount === 1 ? 'reseña' : 'reseñas'})</span>
                  </>
                ) : (
                  <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">star</span>
                    Sin calificaciones
                  </span>
                )}
              </div>

              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-3 bg-surface-container-low px-2.5 py-1 rounded-md inline-block">{clinic.city}</p>
              
              <div className="flex gap-2 items-start text-sm text-on-surface-variant mb-4">
                <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5 shrink-0">location_on</span>
                <p className="font-medium text-xs md:text-sm line-clamp-2">{clinic.address}</p>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-outline-variant/30 pt-4 mt-auto">
              <span className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1">
                Ver Detalles <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
              </span>
              <Link
                href={`/citas?clinicId=${clinic.id}`}
                onClick={(e) => e.stopPropagation()}
                className="bg-primary/5 text-primary hover:bg-primary hover:text-on-primary px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              >
                Reservar Cita
              </Link>
            </div>
          </div>
        ))}

        {filteredClinics.length === 0 && (
          <div className="col-span-full bg-surface-container-low rounded-3xl p-12 text-center text-on-surface-variant border border-dashed border-outline-variant">
            <span className="material-symbols-outlined text-4xl mb-2 text-on-surface-variant/60">search_off</span>
            <p className="font-bold text-sm">No se encontraron clínicas con los criterios de búsqueda.</p>
          </div>
        )}
      </div>

      {/* Clinic Details Sidebar/Modal */}
      {selectedClinic && (
        <div 
          onClick={() => setSelectedClinic(null)}
          className="fixed inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-end z-[100] animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest w-full max-w-xl h-full shadow-2xl p-6 md:p-8 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300"
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full w-max text-xs font-bold">
                    <span className="material-symbols-outlined text-[16px]">local_hospital</span>
                    Clínica Veterinaria
                  </div>
                  <h3 className="font-bold text-2xl md:text-3xl text-primary leading-tight">{selectedClinic.clinic_name}</h3>
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mt-1">{selectedClinic.city}</p>
                </div>
                <button
                  onClick={() => setSelectedClinic(null)}
                  className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Basic Info */}
              <div className="space-y-4 mb-8">
                <div className="flex gap-3 items-start bg-surface-container-low p-4 rounded-2xl">
                  <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">location_on</span>
                  <div>
                    <h5 className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Dirección por Referencia</h5>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">{selectedClinic.address}</p>
                  </div>
                </div>

                {selectedClinic.description && (
                  <div className="bg-surface-container-low p-4 rounded-2xl">
                    <h5 className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mb-1">Descripción / Servicios</h5>
                    <p className="text-sm text-on-surface-variant italic font-medium">&quot;{selectedClinic.description}&quot;</p>
                  </div>
                )}
              </div>

              {/* Ratings Summary */}
              <div className="border-t border-outline-variant/60 pt-6 mb-8">
                <h4 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">star_half</span>
                  Calificaciones y Reseñas
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-surface-container-low/40 p-5 rounded-2xl border border-outline-variant/30">
                  {/* Big Number */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center text-center border-r-0 md:border-r border-outline-variant/40 md:pr-4 py-2">
                    <span className="text-5xl font-black text-primary leading-none">{selectedClinic.avgRating || '0.0'}</span>
                    <div className="flex text-amber-400 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className="material-symbols-outlined text-[20px]"
                          style={{ fontVariationSettings: star <= Math.round(selectedClinic.avgRating || 0) ? "'FILL' 1" : undefined }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-on-surface-variant font-bold mt-2">
                      {selectedClinic.reviewCount || 0} {selectedClinic.reviewCount === 1 ? 'opinión' : 'opiniones'}
                    </span>
                  </div>

                  {/* Bars Breakdown */}
                  <div className="md:col-span-7 space-y-2">
                    {ratingBreakdown.map(({ stars, count, percentage }) => (
                      <div key={stars} className="flex items-center gap-3 text-xs">
                        <span className="w-3 text-right font-bold text-on-surface-variant">{stars}</span>
                        <span className="material-symbols-outlined text-amber-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-right font-semibold text-on-surface-variant">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews Feed */}
              <div className="space-y-4">
                <h4 className="font-bold text-base text-primary">Opiniones de los Clientes</h4>
                
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 divide-y divide-outline-variant/30">
                  {clinicReviews.map((review, idx) => {
                    const dateStr = new Date(review.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    });

                    return (
                      <div key={idx} className={`pt-4 ${idx === 0 ? '' : 'border-t border-outline-variant/30'} flex gap-3 items-start`}>
                        {/* User Avatar Initials */}
                        <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-secondary/15">
                          {getInitials(review.owner?.full_name || 'Usuario')}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-sm text-on-surface leading-tight">{review.owner?.full_name || 'Dueño de mascota'}</h5>
                            <span className="text-[10px] text-on-surface-variant font-bold">{dateStr}</span>
                          </div>
                          
                          {/* Stars */}
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className="material-symbols-outlined text-[13px]"
                                style={{ fontVariationSettings: star <= review.rating ? "'FILL' 1" : undefined }}
                              >
                                star
                              </span>
                            ))}
                          </div>

                          {review.comment && (
                            <p className="text-xs md:text-sm text-on-surface-variant bg-surface-container-low/40 p-3 rounded-xl border border-outline-variant/20 mt-1 leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {clinicReviews.length === 0 && (
                    <p className="text-center py-6 text-xs text-on-surface-variant italic font-semibold">
                      Esta clínica aún no tiene reseñas. ¡Sé el primero en calificarla después de tu cita!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Actions in Sidebar */}
            <div className="border-t border-outline-variant/50 pt-4 mt-8 bg-surface-container-lowest">
              <Link
                href={`/citas?clinicId=${selectedClinic.id}`}
                className="w-full bg-primary text-on-primary hover:bg-primary-container px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
                Agendar Consulta en esta Clínica
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
