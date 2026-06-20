"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

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

export default function OwnerPetDetails({ petId }: { petId: string }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);

  useEffect(() => {
    async function loadPetData() {
      try {
        const { data: petData, error: petError } = await supabase
          .from('pets')
          .select('*, owner:profiles!owner_id(full_name)')
          .eq('id', petId)
          .single();

        if (petError) throw petError;
        if (petData) setPet(petData);

        const { data: recordsData } = await supabase
          .from('medical_records')
          .select('*, clinic:vet_clinics(clinic_name)')
          .eq('pet_id', petId)
          .order('record_date', { ascending: false });
        
        if (recordsData) setMedicalRecords(recordsData);

        const { data: vaxData } = await supabase
          .from('vaccines')
          .select('*, clinic:vet_clinics(clinic_name)')
          .eq('pet_id', petId)
          .order('date_administered', { ascending: false });

        if (vaxData) setVaccinations(vaxData);
      } catch (err: any) {
        console.error('Error fetching pet details:', err);
        setErrorMsg(err?.message || JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    }
    loadPetData();
  }, [petId, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (errorMsg || !pet) {
    return (
      <div className="p-8 text-center text-error">
        <h2 className="text-xl font-bold mb-2">Error al cargar la mascota</h2>
        <Link href="/mascotas" className="text-primary hover:underline">Volver a Mis Mascotas</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/mascotas" className="p-2 bg-surface-container-low hover:bg-surface-container rounded-xl transition-colors flex items-center text-primary font-bold shadow-sm">
          <span className="material-symbols-outlined text-lg mr-1">arrow_back</span>
          Volver
        </Link>
      </div>

      <div className="bg-gradient-to-br from-primary-container to-surface-container-lowest border border-outline-variant/60 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center md:items-center gap-8 shadow-sm">
        <img 
          src={pet.avatar_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400'} 
          alt={pet.name} 
          className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
        />
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-1">{pet.name}</h1>
          <p className="text-on-surface-variant font-bold text-lg mb-6">{pet.species} • {pet.breed}</p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl flex items-center gap-3 border border-outline-variant/30 shadow-sm">
              <span className="material-symbols-outlined text-primary">cake</span>
              <div>
                <p className="text-[10px] uppercase font-bold text-on-surface-variant">Edad</p>
                <p className="font-bold text-on-surface text-sm">{calculateAge(pet.birth_date)}</p>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl flex items-center gap-3 border border-outline-variant/30 shadow-sm">
              <span className="material-symbols-outlined text-primary">scale</span>
              <div>
                <p className="text-[10px] uppercase font-bold text-on-surface-variant">Peso</p>
                <p className="font-bold text-on-surface text-sm">{pet.weight ? `${pet.weight} kg` : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-secondary-container text-on-secondary-container rounded-2xl shadow-sm">
              <span className="material-symbols-outlined">vaccines</span>
            </div>
            <h3 className="text-2xl font-bold text-primary">Cartilla de Vacunación</h3>
          </div>

          <div className="space-y-4">
            {vaccinations.length === 0 ? (
              <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-3xl p-8 text-center">
                <p className="text-on-surface-variant text-sm font-medium">Aún no hay vacunas registradas en la cartilla digital.</p>
              </div>
            ) : (
              vaccinations.map((vax) => {
                const isOverdue = vax.next_due_date && new Date(vax.next_due_date) < new Date();
                return (
                  <div key={vax.id} className={`bg-surface-container-lowest border ${isOverdue ? 'border-error/50' : 'border-outline-variant/50'} rounded-3xl p-6 shadow-sm relative overflow-hidden group`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-2 ${isOverdue ? 'bg-error' : 'bg-secondary'}`}></div>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-bold text-on-surface flex items-center gap-2">
                        {vax.name}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-surface-container-low/50 p-4 rounded-2xl">
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Dosis Aplicada</p>
                        <p className="text-sm font-bold text-on-surface">
                          {new Date(vax.date_administered || vax.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      {vax.next_due_date && (
                        <div>
                          <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isOverdue ? 'text-error' : 'text-on-surface-variant'}`}>Próxima Dosis</p>
                          <p className={`text-sm font-bold ${isOverdue ? 'text-error' : 'text-on-surface'}`}>
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

        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary-container text-on-primary-container rounded-2xl shadow-sm">
              <span className="material-symbols-outlined">prescriptions</span>
            </div>
            <h3 className="text-2xl font-bold text-primary">Recetas y Consultas</h3>
          </div>

          <div className="space-y-4">
            {medicalRecords.length === 0 ? (
              <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-3xl p-8 text-center">
                <p className="text-on-surface-variant text-sm font-medium">No hay registros de consultas o recetas recientes.</p>
              </div>
            ) : (
              medicalRecords.map((record) => (
                <div key={record.id} className="bg-surface-container-lowest border border-outline-variant/50 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary"></div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-primary bg-primary-container px-3 py-1.5 rounded-full">
                      {new Date(record.record_date || record.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    {record.clinic?.clinic_name && (
                      <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1 bg-surface-container px-3 py-1.5 rounded-full">
                        <span className="material-symbols-outlined text-[14px]">local_hospital</span>
                        {record.clinic.clinic_name}
                      </span>
                    )}
                  </div>
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-1">Diagnóstico</h4>
                    <p className="text-on-surface font-semibold bg-surface-container-low p-3 rounded-xl">{record.diagnosis}</p>
                  </div>
                  {record.treatment && (
                    <div>
                      <h4 className="text-sm font-bold text-secondary uppercase tracking-wider mb-1">Receta / Indicaciones</h4>
                      <p className="text-on-surface font-medium bg-secondary-container/20 p-3 rounded-xl border border-secondary/20">{record.treatment}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
