"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PetDetails() {
  const params = useParams();
  const id = params?.id as string;

  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState<any>(null);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    async function loadPetData() {
      try {
        // Fetch pet details
        const { data: petData, error: petError } = await supabase
          .from('pets')
          .select('*, owner:profiles!owner_id(full_name)')
          .eq('id', id)
          .single();

        if (petError) throw petError;
        if (petData) setPet(petData);

        // Fetch medical records
        const { data: recordsData } = await supabase
          .from('medical_records')
          .select('*, clinic:vet_clinics(clinic_name)')
          .eq('pet_id', id)
          .order('record_date', { ascending: false });
        
        if (recordsData) setMedicalRecords(recordsData);

        // Fetch vaccinations
        const { data: vaxData } = await supabase
          .from('vaccinations')
          .select('*, clinic:vet_clinics(clinic_name)')
          .eq('pet_id', id)
          .order('administered_date', { ascending: false });

        if (vaxData) setVaccinations(vaxData);
      } catch (err) {
        console.error('Error fetching pet details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPetData();
  }, [id]);

  function calculateAge(birthDateStr: string | null): string {
    if (!birthDateStr) return 'Edad desc.';
    const birthDate = new Date(birthDateStr);
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years > 0) return `${years} ${years === 1 ? 'Año' : 'Años'}`;
    return `${months} ${months === 1 ? 'Mes' : 'Meses'}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="p-8 text-center text-on-surface-variant">
        <h2 className="text-xl font-bold mb-2">Mascota no encontrada</h2>
        <Link href="/mascotas" className="text-primary hover:underline">Volver a Mascotas</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/mascotas" className="p-2 hover:bg-surface-container-low rounded-lg transition-colors flex items-center text-on-surface-variant">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
        </Link>
        <span className="font-semibold text-on-surface-variant">Volver al Directorio</span>
      </div>

      {/* Pet Header */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm">
        <img 
          src={pet.avatar_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200&auto=format&fit=crop'} 
          alt={pet.name} 
          className="w-40 h-40 rounded-full object-cover border-4 border-surface shadow-md"
        />
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <h1 className="text-headline-lg font-bold text-primary tracking-tight">{pet.name}</h1>
            <span className="px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-sm font-bold tracking-wider uppercase inline-flex self-center">
              {pet.medical_notes || 'Saludable'}
            </span>
          </div>
          <p className="text-on-surface-variant font-medium text-lg mb-6">{pet.species} • {pet.breed}</p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="bg-surface-container-low px-5 py-3 rounded-2xl flex items-center gap-3 border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary">cake</span>
              <div>
                <p className="text-[10px] uppercase font-bold text-on-surface-variant">Edad</p>
                <p className="font-bold text-on-surface text-sm">{calculateAge(pet.birth_date)}</p>
              </div>
            </div>
            <div className="bg-surface-container-low px-5 py-3 rounded-2xl flex items-center gap-3 border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary">scale</span>
              <div>
                <p className="text-[10px] uppercase font-bold text-on-surface-variant">Peso</p>
                <p className="font-bold text-on-surface text-sm">{pet.weight ? `${pet.weight} kg` : 'N/A'}</p>
              </div>
            </div>
            <div className="bg-surface-container-low px-5 py-3 rounded-2xl flex items-center gap-3 border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary">person</span>
              <div>
                <p className="text-[10px] uppercase font-bold text-on-surface-variant">Dueño</p>
                <p className="font-bold text-on-surface text-sm">{pet.owner?.full_name || 'Desconocido'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two columns for clinical history and vaccines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Historial Clínico */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-container text-on-primary-container rounded-xl">
              <span className="material-symbols-outlined">medical_information</span>
            </div>
            <h3 className="text-title-md font-bold text-on-surface">Historial Clínico</h3>
          </div>

          <div className="space-y-4">
            {medicalRecords.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-8 text-center shadow-sm">
                <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">description</span>
                <p className="text-on-surface-variant text-sm">No hay registros médicos para {pet.name}.</p>
              </div>
            ) : (
              medicalRecords.map((record) => (
                <div key={record.id} className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-2xl"></div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
                      {new Date(record.record_date || record.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    {record.clinic?.clinic_name && (
                      <span className="text-xs font-semibold text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">local_hospital</span>
                        {record.clinic.clinic_name}
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-1">Diagnóstico</h4>
                    <p className="text-on-surface font-medium">{record.diagnosis}</p>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-1">Tratamiento</h4>
                    <p className="text-on-surface-variant text-sm">{record.treatment}</p>
                  </div>
                  {record.notes && (
                    <div className="mt-4 pt-4 border-t border-outline-variant/30">
                      <h4 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Notas del Veterinario</h4>
                      <p className="text-on-surface-variant text-sm italic">{record.notes}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vacunación */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-secondary-container text-on-secondary-container rounded-xl">
              <span className="material-symbols-outlined">vaccines</span>
            </div>
            <h3 className="text-title-md font-bold text-on-surface">Registro de Vacunación</h3>
          </div>

          <div className="space-y-4">
            {vaccinations.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-8 text-center shadow-sm">
                <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">inventory_2</span>
                <p className="text-on-surface-variant text-sm">No hay registro de vacunas para {pet.name}.</p>
              </div>
            ) : (
              vaccinations.map((vax) => {
                const isOverdue = vax.next_due_date && new Date(vax.next_due_date) < new Date();
                return (
                  <div key={vax.id} className={`bg-surface-container-lowest border ${isOverdue ? 'border-error/50' : 'border-outline-variant/50'} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isOverdue ? 'bg-error' : 'bg-secondary'} rounded-l-2xl`}></div>
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-base font-bold text-on-surface flex items-center gap-2">
                        {vax.vaccine_name}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Administrada</p>
                        <p className="text-sm font-semibold text-on-surface">
                          {new Date(vax.administered_date || vax.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      {vax.next_due_date && (
                        <div>
                          <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isOverdue ? 'text-error' : 'text-on-surface-variant'}`}>Próxima Dosis</p>
                          <p className={`text-sm font-semibold ${isOverdue ? 'text-error' : 'text-on-surface'}`}>
                            {new Date(vax.next_due_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
