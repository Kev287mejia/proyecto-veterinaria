"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Clinic {
  id: string;
  clinic_name: string;
  city: string | null;
  address: string | null;
  license_number: string | null;
  created_at: string;
  owner_id: string | null;
}

export default function AdminClinics() {
  const supabase = createClient();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    clinic_name: '',
    city: '',
    address: '',
    license_number: ''
  });

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vet_clinics')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setClinics(data);
    setLoading(false);
  };

  const handleCreateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('vet_clinics')
        .insert([
          {
            clinic_name: formData.clinic_name,
            city: formData.city || null,
            address: formData.address || null,
            license_number: formData.license_number || null,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setClinics([data, ...clinics]);
      setIsModalOpen(false);
      setFormData({ clinic_name: '', city: '', address: '', license_number: '' });
      alert("Clínica registrada exitosamente.");
    } catch (error: any) {
      console.error("Error creating clinic:", error);
      alert("Hubo un error al registrar la clínica: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClinic = async (id: string, name: string) => {
    const confirmDelete = confirm(`¿Estás seguro que deseas eliminar permanentemente la clínica "${name}"?\nEsta acción no se puede deshacer.`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('vet_clinics')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setClinics(clinics.filter(c => c.id !== id));
    } catch (error: any) {
      console.error("Error deleting clinic:", error);
      alert("No se pudo eliminar la clínica. Es posible que tenga registros asociados.");
    }
  };

  const filteredClinics = clinics.filter(c => 
    (c.clinic_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/50 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl text-tertiary">domain</span>
            Gestión de Clínicas
          </h2>
          <p className="text-on-surface-variant mt-1">Administra las sucursales y licencias del sistema.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              type="text"
              placeholder="Buscar clínica..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-2xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-6 rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-2 justify-center whitespace-nowrap"
          >
            <span className="material-symbols-outlined">add</span>
            Nueva Clínica
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClinics.map((clinic) => (
            <div key={clinic.id} className="bg-surface-container-lowest border border-outline-variant p-6 rounded-3xl shadow-sm relative group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-tertiary-container text-on-tertiary-container rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">local_hospital</span>
                </div>
                <button 
                  onClick={() => handleDeleteClinic(clinic.id, clinic.clinic_name)}
                  className="w-8 h-8 rounded-full hover:bg-error-container text-on-surface-variant hover:text-error flex items-center justify-center transition-colors"
                  title="Eliminar Clínica"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-on-surface">{clinic.clinic_name}</h3>
              <p className="text-sm font-mono text-on-surface-variant mb-4">ID: {clinic.id.split('-')[0]}</p>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-start gap-2 text-sm text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-tertiary shrink-0">location_on</span>
                  <span>{clinic.address ? `${clinic.address}${clinic.city ? `, ${clinic.city}` : ''}` : clinic.city || 'Ubicación no especificada'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-tertiary shrink-0">badge</span>
                  <span>Licencia: {clinic.license_number || 'No registrada'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-tertiary shrink-0">calendar_today</span>
                  <span>Registrada: {new Date(clinic.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredClinics.length === 0 && (
            <div className="col-span-full bg-surface-container-lowest border border-outline-variant/50 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">domain_disabled</span>
              <h3 className="text-xl font-bold text-on-surface">No se encontraron clínicas</h3>
              <p className="text-on-surface-variant mt-2 max-w-md mx-auto">
                {searchQuery ? "No hay resultados para tu búsqueda." : "No hay ninguna clínica registrada en el sistema. Haz clic en 'Nueva Clínica' para empezar."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Clinic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border border-outline-variant">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-on-surface">Registrar Clínica</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:bg-surface-container rounded-full p-1 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateClinic} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface-variant ml-1">Nombre de la Clínica *</label>
                <input
                  required
                  type="text"
                  value={formData.clinic_name}
                  onChange={(e) => setFormData({...formData, clinic_name: e.target.value})}
                  className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Ej. Clínica Veterinaria San Roque"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant ml-1">Ciudad</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Ej. Madrid"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant ml-1">Nº Licencia</label>
                  <input
                    type="text"
                    value={formData.license_number}
                    onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                    className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Ej. VET-2023-458"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface-variant ml-1">Dirección Completa</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Ej. Av. Principal 123"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold py-3.5 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary hover:bg-primary/90 text-on-primary font-bold py-3.5 rounded-2xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">save</span>
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
