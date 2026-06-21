"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface Appointment {
  id: string;
  pet: {
    id: string;
    name: string;
    breed: string;
    avatar_url: string;
  } | null;
  clinic: {
    id: string;
    clinic_name: string;
  } | null;
  owner: {
    id: string;
    full_name: string;
    phone?: string;
  } | null;
  appointment_date: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
}

interface PetOption {
  id: string;
  name: string;
  owner_name?: string;
  owner_id?: string;
}

interface ClinicOption {
  id: string;
  clinic_name: string;
}

export default function Citas() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    }>
      <CitasContent />
    </Suspense>
  );
}

function CitasContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const preselectedClinicId = searchParams.get('clinicId');

  // Page States
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Options for modal
  const [myPets, setMyPets] = useState<PetOption[]>([]);
  const [clinics, setClinics] = useState<ClinicOption[]>([]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClinics, setSelectedClinics] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewTab, setViewTab] = useState<'day' | 'week' | 'month'>('week');

  // Form States
  const [formPetId, setFormPetId] = useState('');
  const [formClinicId, setFormClinicId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('09:00');
  const [formReason, setFormReason] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Reviews States
  const [userReviews, setUserReviews] = useState<Record<string, any>>({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedApptForReview, setSelectedApptForReview] = useState<Appointment | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [savingReview, setSavingReview] = useState(false);

  // Load appointments, clinics, and pets
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUser(user);

        // Load profile to get role
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(userProfile);

        // Load Owner's reviews
        if (userProfile?.role === 'owner') {
          const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews')
            .select('id, appointment_id, rating, comment')
            .eq('owner_id', user.id);
          if (!reviewsError && reviewsData) {
            const revMap: Record<string, any> = {};
            reviewsData.forEach((rev: any) => {
              revMap[rev.appointment_id] = rev;
            });
            setUserReviews(revMap);
          }
        }

        // Load Clinics
        const { data: clinicsData } = await supabase
          .from('vet_clinics')
          .select('id, clinic_name');
        if (clinicsData) {
          setClinics(clinicsData);
          if (preselectedClinicId) {
            setFormClinicId(preselectedClinicId);
            setIsAddModalOpen(true);
          } else if (clinicsData.length > 0) {
            setFormClinicId(clinicsData[0].id);
          }
        }

        // Load Owner's pets
        let petsQuery = supabase.from('pets').select('id, name, owner_id, owner:profiles!owner_id(full_name)');
        if (userProfile?.role === 'owner') {
          petsQuery = petsQuery.eq('owner_id', user.id);
        }
        let { data: petsData, error: petsError } = await petsQuery;
        
        console.log("CITAS - USER PROFILE:", userProfile);
        console.log("CITAS - PETS DATA (Primary):", petsData);
        console.log("CITAS - PETS ERROR (Primary):", petsError);

        // Fallback: If primary query fails or returns null due to RLS/join issues, try a simple select without join
        if (petsError || !petsData) {
          console.warn("Primary query failed or returned no data, executing fallback query...");
          let fallbackQuery = supabase.from('pets').select('id, name, owner_id');
          if (userProfile?.role === 'owner') {
            fallbackQuery = fallbackQuery.eq('owner_id', user.id);
          }
          const { data: fallbackData, error: fallbackError } = await fallbackQuery;
          
          console.log("CITAS - PETS DATA (Fallback):", fallbackData);
          console.log("CITAS - PETS ERROR (Fallback):", fallbackError);
          
          if (!fallbackError && fallbackData) {
            petsData = fallbackData as any;
            petsError = null;
          }
        }

        if (petsData) {
          const mappedPets = petsData.map((p: any) => ({
            id: p.id,
            name: p.name,
            owner_name: p.owner?.full_name || 'Dueño',
            owner_id: p.owner_id
          }));
          setMyPets(mappedPets);
          if (mappedPets.length > 0) {
            setFormPetId(mappedPets[0].id);
          }
        }

        // Load Appointments
        let apptQuery = supabase
          .from('appointments')
          .select(`
            id,
            appointment_date,
            reason,
            status,
            notes,
            pet:pets(id, name, breed, avatar_url),
            clinic:vet_clinics!vet_id(id, clinic_name),
            owner:profiles!owner_id(id, full_name, phone)
          `)
          .order('appointment_date', { ascending: true });

        if (userProfile?.role === 'owner') {
          apptQuery = apptQuery.eq('owner_id', user.id);
        }

        const { data: apptsData, error: apptsError } = await apptQuery;
        if (apptsError) {
          console.error('Error fetching appointments:', apptsError);
        } else if (apptsData) {
          setAppointments(apptsData as any);
        }
      } catch (err) {
        console.error('Error in loadData:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Helper for WhatsApp Links
  const openWhatsApp = (phone: string, message: string) => {
    if (!phone) {
      alert("El destinatario no tiene un número de teléfono registrado en su perfil.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Handle adding a new appointment
  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPetId || !formClinicId || !formDate || !formTime || !formReason || !currentUser) {
      alert('Por favor, rellene todos los campos obligatorios.');
      return;
    }

    const dateTimeStr = `${formDate}T${formTime}:00Z`;

    const selectedPet = myPets.find(p => p.id === formPetId);
    const targetOwnerId = (profile?.role === 'vet' || profile?.role === 'admin') 
                            ? (selectedPet?.owner_id || currentUser.id)
                            : currentUser.id;

    const initialStatus = (profile?.role === 'vet' || profile?.role === 'admin') ? 'confirmed' : 'pending';

    const { data: newApptData, error } = await supabase
      .from('appointments')
      .insert({
        pet_id: formPetId,
        vet_id: formClinicId,
        owner_id: targetOwnerId,
        appointment_date: dateTimeStr,
        reason: formReason,
        notes: formNotes || null,
        status: initialStatus
      })
      .select(`
        id,
        appointment_date,
        reason,
        status,
        notes,
        pet:pets(id, name, breed, avatar_url),
        clinic:vet_clinics!vet_id(id, clinic_name),
        owner:profiles!owner_id(id, full_name)
      `)
      .single();

    if (error) {
      console.error('Error saving appointment:', error);
      alert('Error al agendar cita: ' + error.message);
      return;
    }

    if (newApptData) {
      setAppointments([...appointments, newApptData as any]);

      // If owner is requesting, pop open WhatsApp to send to the Vet
      if (initialStatus === 'pending') {
        const fetchClinicOwner = async () => {
          const { data: clinicData } = await supabase
            .from('vet_clinics')
            .select('owner:profiles!owner_id(phone)')
            .eq('id', formClinicId)
            .single();
          
          const vetPhone = (clinicData?.owner as any)?.phone;
          if (vetPhone) {
            const dateFmt = new Date(dateTimeStr).toLocaleString();
            const msg = `¡Hola! He solicitado una nueva cita para mi mascota ${selectedPet?.name} el ${dateFmt}. El motivo es: ${formReason}.`;
            openWhatsApp(vetPhone, msg);
          } else {
            console.log("Clinic owner has no phone registered.");
          }
        };
        fetchClinicOwner();
      }
    }

    // Reset Form fields
    setFormReason('');
    setFormNotes('');
    setIsAddModalOpen(false);
  };

  // Toggle or Update Appointment Status
  const handleUpdateStatus = async (id: string, newStatus: Appointment['status']) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar estado: ' + error.message);
      return;
    }

    setAppointments(appointments.map(appt => 
      appt.id === id ? { ...appt, status: newStatus } : appt
    ));

    // If vet is approving the appointment, pop open WhatsApp to notify the owner
    if (newStatus === 'confirmed') {
      const appt = appointments.find(a => a.id === id);
      if (appt && appt.owner?.phone) {
        const dateFmt = new Date(appt.appointment_date).toLocaleString();
        const msg = `¡Hola ${appt.owner.full_name}! Te confirmamos que tu cita para ${appt.pet?.name} ha sido APROBADA para el ${dateFmt}.`;
        openWhatsApp(appt.owner.phone, msg);
      } else {
         console.log("No owner phone found for this appointment");
      }
    }
  };

  // Reviews handlers
  const handleOpenReviewModal = (appt: Appointment) => {
    setSelectedApptForReview(appt);
    const existingReview = userReviews[appt.id];
    if (existingReview) {
      setReviewRating(existingReview.rating);
      setReviewComment(existingReview.comment || '');
    } else {
      setReviewRating(5);
      setReviewComment('');
    }
    setReviewHoverRating(0);
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApptForReview || !currentUser) return;
    
    setSavingReview(true);
    const existingReview = userReviews[selectedApptForReview.id];
    const reviewData = {
      appointment_id: selectedApptForReview.id,
      owner_id: currentUser.id,
      clinic_id: selectedApptForReview.clinic?.id,
      rating: reviewRating,
      comment: reviewComment || null
    };

    let error;
    let savedData;

    if (existingReview) {
      // Update
      const { data, error: updateError } = await supabase
        .from('reviews')
        .update({
          rating: reviewRating,
          comment: reviewComment || null
        })
        .eq('id', existingReview.id)
        .select()
        .single();
      error = updateError;
      savedData = data;
    } else {
      // Insert
      const { data, error: insertError } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single();
      error = insertError;
      savedData = data;
    }

    setSavingReview(false);

    if (error) {
      console.error('Error saving review:', error);
      alert('Error al guardar la reseña: ' + error.message);
    } else {
      setUserReviews(prev => ({
        ...prev,
        [selectedApptForReview.id]: savedData
      }));
      setIsReviewModalOpen(false);
    }
  };

  const handleDeleteReview = async (apptId: string) => {
    const existingReview = userReviews[apptId];
    if (!existingReview) return;
    
    if (!confirm('¿Estás seguro de que deseas eliminar esta reseña?')) return;

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', existingReview.id);

    if (error) {
      console.error('Error deleting review:', error);
      alert('Error al eliminar la reseña: ' + error.message);
    } else {
      setUserReviews(prev => {
        const copy = { ...prev };
        delete copy[apptId];
        return copy;
      });
      setIsReviewModalOpen(false);
    }
  };

  // Filters logic
  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = 
      appt.reason.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (appt.pet?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (appt.owner?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClinic = 
      selectedClinics.length === 0 || 
      (appt.clinic && selectedClinics.includes(appt.clinic.id));

    return matchesSearch && matchesClinic;
  });

  const getStatusBadgeClass = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-secondary-container text-on-secondary-container';
      case 'completed':
        return 'bg-surface-variant text-on-surface-variant';
      case 'cancelled':
        return 'bg-error-container text-on-error-container';
      case 'pending':
      default:
        return 'bg-primary-fixed text-on-primary-fixed-variant border border-primary/20';
    }
  };

  const getStatusText = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Finalizada';
      case 'cancelled': return 'Cancelada';
      case 'pending':
      default:
        return 'Pendiente';
    }
  };

  const toggleClinicFilter = (clinicId: string) => {
    if (selectedClinics.includes(clinicId)) {
      setSelectedClinics(selectedClinics.filter(id => id !== clinicId));
    } else {
      setSelectedClinics([...selectedClinics, clinicId]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Count active/pending appointments
  const activeCount = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-headline-lg text-[28px] md:text-[32px] text-primary tracking-tight font-bold">Agenda de Citas</h2>
          <p className="text-on-surface-variant font-body-sm text-sm">Gestiona tus consultas y citas programadas.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-surface-container-high p-1 rounded-lg flex">
            <button 
              onClick={() => setViewTab('day')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${viewTab === 'day' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant'}`}
            >
              Día
            </button>
            <button 
              onClick={() => setViewTab('week')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${viewTab === 'week' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant'}`}
            >
              Semana
            </button>
            <button 
              onClick={() => setViewTab('month')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${viewTab === 'month' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant'}`}
            >
              Mes
            </button>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-primary-container active:scale-95 transition-all shadow-md text-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nueva Cita
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column: Mini Calendar & Filter checkboxes */}
        <div className="lg:col-span-4 space-y-6">
          {/* Calendar Box */}
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-primary">Junio 2026</h3>
              <div className="flex gap-1">
                <button className="p-1.5 hover:bg-surface-container-low rounded-md text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                <button className="p-1.5 hover:bg-surface-container-low rounded-md text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-center text-[11px] font-bold text-on-surface-variant/80 mb-2">
              <span>DO</span><span>LU</span><span>MA</span><span>MI</span><span>JU</span><span>VI</span><span>SA</span>
            </div>
            <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-on-surface">
              <span className="py-1.5 text-outline-variant opacity-40">25</span>
              <span className="py-1.5 text-outline-variant opacity-40">26</span>
              <span className="py-1.5 text-outline-variant opacity-40">27</span>
              <span className="py-1.5 text-outline-variant opacity-40">28</span>
              <span className="py-1.5 text-outline-variant opacity-40">29</span>
              <span className="py-1.5 text-outline-variant opacity-40">30</span>
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">1</span>
              
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">2</span>
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">3</span>
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">4</span>
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">5</span>
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">6</span>
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">7</span>
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">8</span>
              
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">9</span>
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">10</span>
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">11</span>
              <span className="py-1.5 bg-primary text-on-primary rounded-full font-bold">12</span>
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">13</span>
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">14</span>
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">15</span>
              
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">16</span>
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">17</span>
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">18</span>
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">19</span>
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">20</span>
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">21</span>
              <span className="py-1.5 hover:bg-surface-container-low rounded-full cursor-pointer">22</span>
            </div>
          </div>

          {/* Clinics Filter */}
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-on-surface-variant uppercase tracking-wider mb-4">Clínicas Disponibles</h3>
            <div className="space-y-3">
              {clinics.map(clinic => (
                <label key={clinic.id} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedClinics.includes(clinic.id)}
                    onChange={() => toggleClinicFilter(clinic.id)}
                    className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4 bg-surface-container-lowest cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{clinic.clinic_name}</span>
                  </div>
                </label>
              ))}
              {clinics.length === 0 && (
                <p className="text-xs text-on-surface-variant">No hay clínicas registradas.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Appointments List */}
        <div className="lg:col-span-8">
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-lowest">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-primary">Listado de Citas</h3>
                <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                  {activeCount} ACTIVAS
                </span>
              </div>
              <input
                type="text"
                placeholder="Buscar por motivo o mascota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1 rounded-lg border border-outline-variant/80 text-xs bg-surface-container-lowest focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
              />
            </div>

            <div className="divide-y divide-outline-variant/40">
              {filteredAppointments.map((appt) => {
                const dateObj = new Date(appt.appointment_date);
                const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                const ampm = dateObj.getHours() >= 12 ? 'PM' : 'AM';

                return (
                  <div key={appt.id} className="p-5 hover:bg-surface-container-low/20 transition-colors flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center min-w-[60px] py-1 border-r border-outline-variant/40">
                      <span className="text-lg font-bold text-primary leading-tight">{timeStr}</span>
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase mt-0.5">{ampm}</span>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <img 
                          className="w-10 h-10 rounded-full object-cover border border-outline-variant"
                          src={appt.pet?.avatar_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200'} 
                          alt={appt.pet?.name || 'Mascota'} 
                        />
                        <div>
                          <p className="font-bold text-on-surface text-sm">{appt.pet?.name || 'Paciente desconocido'}</p>
                          <p className="text-xs text-on-surface-variant">{appt.pet?.breed || 'Sin raza'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-0.5">Cliente / Clínica</p>
                        <p className="text-xs text-on-surface font-semibold">
                          {appt.owner?.full_name || 'Dueño desc.'} <span className="text-outline-variant mx-1">•</span> {appt.clinic?.clinic_name || 'Clínica desc.'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-0.5">Motivo</p>
                        <p className="text-xs text-on-surface truncate font-semibold">{appt.reason}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 min-w-[100px]">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(appt.status)}`}>
                        {getStatusText(appt.status)}
                      </span>
                      <div className="flex gap-1">
                        {appt.status === 'pending' && profile?.role === 'vet' && (
                          <button 
                            onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                            className="p-1 hover:bg-surface-container-high rounded text-secondary transition-colors"
                            title="Aceptar Cita"
                          >
                            <span className="material-symbols-outlined text-base">check_circle</span>
                          </button>
                        )}
                        {appt.status === 'confirmed' && (profile?.role === 'vet' || profile?.role === 'admin') && (
                          <button 
                            onClick={() => handleUpdateStatus(appt.id, 'completed')}
                            className="p-1 hover:bg-surface-container-high rounded text-primary transition-colors"
                            title="Finalizar Consulta"
                          >
                            <span className="material-symbols-outlined text-base">task_alt</span>
                          </button>
                        )}
                        {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                          <button 
                            onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                            className="p-1 hover:bg-surface-container-high rounded text-error transition-colors"
                            title={profile?.role === 'vet' && appt.status === 'pending' ? "Rechazar Cita" : "Cancelar Cita"}
                          >
                            <span className="material-symbols-outlined text-base">cancel</span>
                          </button>
                        )}
                      </div>
                      {appt.status === 'completed' && profile?.role === 'owner' && (
                        userReviews[appt.id] ? (
                          <div className="mt-1 flex flex-col items-end gap-1">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span 
                                  key={star} 
                                  className={`material-symbols-outlined text-[14px] ${star <= userReviews[appt.id].rating ? 'text-amber-400' : 'text-outline-variant'}`}
                                  style={{ fontVariationSettings: star <= userReviews[appt.id].rating ? "'FILL' 1" : undefined }}
                                >
                                  star
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-2 mt-0.5">
                              <button 
                                onClick={() => handleOpenReviewModal(appt)}
                                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[11px]">edit</span> Editar
                              </button>
                              <button 
                                onClick={() => handleDeleteReview(appt.id)}
                                className="text-[10px] font-bold text-error hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[11px]">delete</span> Eliminar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleOpenReviewModal(appt)}
                            className="mt-1 bg-secondary text-on-secondary px-3 py-1.5 rounded-xl text-[11px] font-bold hover:bg-secondary-fixed-dim transition-all flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer animate-pulse"
                          >
                            <span className="material-symbols-outlined text-[13px]">star</span>
                            Calificar
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredAppointments.length === 0 && (
                <div className="p-8 text-center text-on-surface-variant text-sm">
                  No se encontraron citas para este filtro o búsqueda.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Appointment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-lg p-8 rounded-2xl shadow-xl border border-outline-variant/60 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-2xl text-primary">Agendar Nueva Cita</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="pet">Mascota</label>
                <select
                  id="pet"
                  value={formPetId}
                  onChange={(e) => setFormPetId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm text-on-surface cursor-pointer"
                  required
                >
                  <option value="">Selecciona una mascota</option>
                  {myPets.map(pet => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} {pet.owner_name && (profile?.role === 'vet' || profile?.role === 'admin') ? `(Dueño: ${pet.owner_name})` : ''}
                    </option>
                  ))}
                </select>
                {myPets.length === 0 && (
                  <p className="text-xs text-error mt-1">Primero debes registrar una mascota en la sección de Mascotas.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="clinic">Clínica Veterinaria</label>
                <select
                  id="clinic"
                  value={formClinicId}
                  onChange={(e) => setFormClinicId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm text-on-surface cursor-pointer"
                  required
                >
                  <option value="">Selecciona una clínica</option>
                  {clinics.map(c => (
                    <option key={c.id} value={c.id}>{c.clinic_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="date">Fecha</label>
                  <input
                    id="date"
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="time">Hora</label>
                  <input
                    id="time"
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="reason">Motivo de Consulta</label>
                <input
                  id="reason"
                  type="text"
                  required
                  placeholder="Ej: Vacunación Anual o Chequeo de Oídos"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm text-on-surface"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="notes">Notas adicionales (Opcional)</label>
                <textarea
                  id="notes"
                  placeholder="Detalles sobre síntomas o peticiones especiales..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm text-on-surface resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 border border-outline-variant hover:bg-surface-container-low rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={myPets.length === 0}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary rounded-xl text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  Agendar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && selectedApptForReview && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-outline-variant/60 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-primary">
                {userReviews[selectedApptForReview.id] ? 'Editar Calificación' : 'Calificar Servicio'}
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mb-4 bg-surface-container-low p-4 rounded-xl">
              <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-1">Detalles de la Cita</p>
              <p className="text-sm font-bold text-on-surface">{selectedApptForReview.clinic?.clinic_name || 'Clínica Veterinaria'}</p>
              <p className="text-xs text-on-surface-variant">Mascota: {selectedApptForReview.pet?.name || 'Mascota'}</p>
              <p className="text-xs text-on-surface-variant">Fecha: {new Date(selectedApptForReview.appointment_date).toLocaleDateString()}</p>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div className="flex flex-col items-center py-2">
                <label className="block text-sm font-semibold text-on-surface mb-2">¿Cómo calificarías tu experiencia?</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setReviewHoverRating(star)}
                      onMouseLeave={() => setReviewHoverRating(0)}
                      className="p-1 hover:scale-115 transition-transform cursor-pointer"
                    >
                      <span
                        className={`material-symbols-outlined text-[36px] transition-colors ${
                          star <= (reviewHoverRating || reviewRating) ? 'text-amber-400' : 'text-outline-variant'
                        }`}
                        style={{ fontVariationSettings: star <= (reviewHoverRating || reviewRating) ? "'FILL' 1" : undefined }}
                      >
                        star
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs font-bold text-amber-500 mt-2 h-4">
                  {((reviewHoverRating || reviewRating) === 1) && "Muy malo"}
                  {((reviewHoverRating || reviewRating) === 2) && "Malo"}
                  {((reviewHoverRating || reviewRating) === 3) && "Regular"}
                  {((reviewHoverRating || reviewRating) === 4) && "Bueno"}
                  {((reviewHoverRating || reviewRating) === 5) && "Excelente"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="comment">Comentario (Opcional)</label>
                <textarea
                  id="comment"
                  placeholder="Comparte tu experiencia para ayudar a otros dueños de mascotas..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm text-on-surface resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                {userReviews[selectedApptForReview.id] && (
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(selectedApptForReview.id)}
                    className="mr-auto px-4 py-2 border border-error text-error hover:bg-error-container hover:text-on-error-container rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Eliminar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-5 py-2.5 border border-outline-variant hover:bg-surface-container-low rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingReview}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary rounded-xl text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  {savingReview ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">save</span>
                  )}
                  {userReviews[selectedApptForReview.id] ? 'Guardar' : 'Calificar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
