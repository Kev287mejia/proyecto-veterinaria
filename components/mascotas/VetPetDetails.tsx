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

export default function VetPetDetails({ petId, vetId }: { petId: string, vetId: string }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [activeClinicId, setActiveClinicId] = useState<string | null>(null);
  
  const [showMedModal, setShowMedModal] = useState(false);
  const [medForm, setMedForm] = useState({ diagnosis: '', treatment: '', notes: '' });
  const [isSubmittingMed, setIsSubmittingMed] = useState(false);

  const [showVaxModal, setShowVaxModal] = useState(false);
  const [vaxForm, setVaxForm] = useState({ name: '', date_administered: new Date().toISOString().split('T')[0], next_due_date: '' });
  const [isSubmittingVax, setIsSubmittingVax] = useState(false);

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
          .order('visit_date', { ascending: false });
        
        if (recordsData) setMedicalRecords(recordsData);

        const { data: vaxData } = await supabase
          .from('vaccines')
          .select('*, clinic:vet_clinics(clinic_name)')
          .eq('pet_id', petId)
          .order('date_administered', { ascending: false });

        if (vaxData) setVaccinations(vaxData);

        // Buscar clínica de este veterinario (owner_id = vetId o current user id)
        const { data: clinicsData } = await supabase
          .from('vet_clinics')
          .select('id')
          .eq('owner_id', vetId);
        
        if (clinicsData && clinicsData.length > 0) {
          setActiveClinicId(clinicsData[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching pet details:', err);
        setErrorMsg(err?.message || JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    }
    loadPetData();
  }, [petId, vetId, supabase]);

  const handleAddMedRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medForm.diagnosis) return;
    setIsSubmittingMed(true);
    try {
      const clinicIdToUse = activeClinicId || vetId; // Si no hay clínica, cae a vetId
      const { data, error } = await supabase.from('medical_records').insert({
        pet_id: petId,
        vet_id: clinicIdToUse,
        diagnosis: medForm.diagnosis,
        treatment: medForm.treatment || null,
        prescription: medForm.notes || null,
        visit_date: new Date().toISOString()
      }).select('*, clinic:vet_clinics(clinic_name)').single();
      
      if (error) throw error;
      if (data) {
        setMedicalRecords([data, ...medicalRecords]);
        setShowMedModal(false);
        setMedForm({ diagnosis: '', treatment: '', notes: '' });
      }
    } catch (err: any) {
      console.error('Error adding medical record:', err);
      alert('Error al guardar el registro clínico: ' + err.message);
    } finally {
      setIsSubmittingMed(false);
    }
  };

  const handleAddVaxRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaxForm.name) return;
    setIsSubmittingVax(true);
    try {
      const clinicIdToUse = activeClinicId || vetId;
      const { data, error } = await supabase.from('vaccines').insert({
        pet_id: petId,
        vet_id: clinicIdToUse,
        name: vaxForm.name,
        date_administered: vaxForm.date_administered || new Date().toISOString().split('T')[0],
        next_due_date: vaxForm.next_due_date || null
      }).select('*, clinic:vet_clinics(clinic_name)').single();
      
      if (error) throw error;
      if (data) {
        setVaccinations([data, ...vaccinations]);
        setShowVaxModal(false);
        setVaxForm({ name: '', date_administered: new Date().toISOString().split('T')[0], next_due_date: '' });
      }
    } catch (err: any) {
      console.error('Error adding vaccine:', err);
      alert('Error al agregar la vacuna: ' + err.message);
    } finally {
      setIsSubmittingVax(false);
    }
  };

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
        <span className="font-semibold text-on-surface-variant">Volver al Directorio Clínico</span>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-container text-on-primary-container rounded-xl">
                <span className="material-symbols-outlined">medical_information</span>
              </div>
              <h3 className="text-title-md font-bold text-on-surface">Historial Clínico</h3>
            </div>
            <button 
              onClick={() => setShowMedModal(true)} 
              className="bg-primary text-on-primary text-sm px-4 py-2 rounded-xl font-semibold flex items-center gap-1 hover:bg-primary/90 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Añadir
            </button>
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
                      {new Date(record.visit_date || record.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
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
                  {record.prescription && (
                    <div className="mt-4 pt-4 border-t border-outline-variant/30">
                      <h4 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Notas del Veterinario / Receta</h4>
                      <p className="text-on-surface-variant text-sm italic">{record.prescription}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary-container text-on-secondary-container rounded-xl">
                <span className="material-symbols-outlined">vaccines</span>
              </div>
              <h3 className="text-title-md font-bold text-on-surface">Registro de Vacunas</h3>
            </div>
            <button 
              onClick={() => setShowVaxModal(true)} 
              className="bg-secondary text-on-secondary text-sm px-4 py-2 rounded-xl font-semibold flex items-center gap-1 hover:bg-secondary/90 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Añadir
            </button>
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
                        {vax.name}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Administrada</p>
                        <p className="text-sm font-semibold text-on-surface">
                          {new Date(vax.date_administered || vax.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
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

      {showMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest sticky top-0 z-10">
              <h3 className="text-xl font-bold text-primary">Añadir Registro Médico</h3>
              <button onClick={() => setShowMedModal(false)} className="text-on-surface-variant hover:text-error transition-colors p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="medForm" onSubmit={handleAddMedRecord} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Diagnóstico <span className="text-error">*</span></label>
                  <input required type="text" value={medForm.diagnosis} onChange={e => setMedForm({...medForm, diagnosis: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Ej. Infección leve" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Tratamiento</label>
                  <input type="text" value={medForm.treatment} onChange={e => setMedForm({...medForm, treatment: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Ej. Amoxicilina 50mg" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Notas Adicionales</label>
                  <textarea rows={3} value={medForm.notes} onChange={e => setMedForm({...medForm, notes: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" placeholder="Observaciones extras..."></textarea>
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest flex justify-end gap-3">
              <button type="button" onClick={() => setShowMedModal(false)} className="px-6 py-2.5 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors">Cancelar</button>
              <button type="submit" form="medForm" disabled={isSubmittingMed || !medForm.diagnosis} className="px-6 py-2.5 rounded-xl font-semibold bg-primary text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-50">
                {isSubmittingMed ? 'Guardando...' : 'Guardar Registro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showVaxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest sticky top-0 z-10">
              <h3 className="text-xl font-bold text-secondary">Añadir Vacuna</h3>
              <button onClick={() => setShowVaxModal(false)} className="text-on-surface-variant hover:text-error transition-colors p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="vaxForm" onSubmit={handleAddVaxRecord} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Nombre de la Vacuna <span className="text-error">*</span></label>
                  <input required type="text" value={vaxForm.name} onChange={e => setVaxForm({...vaxForm, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all" placeholder="Ej. Rabia, Parvovirus" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1">Fecha Administración</label>
                    <input type="date" value={vaxForm.date_administered} onChange={e => setVaxForm({...vaxForm, date_administered: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1">Próxima Dosis (Opcional)</label>
                    <input type="date" value={vaxForm.next_due_date} onChange={e => setVaxForm({...vaxForm, next_due_date: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all text-sm" />
                  </div>
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest flex justify-end gap-3">
              <button type="button" onClick={() => setShowVaxModal(false)} className="px-6 py-2.5 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors">Cancelar</button>
              <button type="submit" form="vaxForm" disabled={isSubmittingVax || !vaxForm.name} className="px-6 py-2.5 rounded-xl font-semibold bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors disabled:opacity-50">
                {isSubmittingVax ? 'Guardando...' : 'Guardar Vacuna'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
