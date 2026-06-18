"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

interface Pet {
  id: string;
  name: string;
  species: 'Caninos' | 'Felinos' | 'Exóticos';
  breed: string;
  age: string;
  weight: string;
  status: 'Saludable' | 'En Observación' | 'En Tratamiento' | 'Crítico';
  image: string;
}

interface RecentRegistration {
  id: string;
  name: string;
  owner: string;
  date: string;
  status: string;
  image: string;
}

interface VaccineReminder {
  id: string;
  petName: string;
  vaccine: string;
  dueText: string;
  type: 'urgent' | 'upcoming';
}

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
  if (years > 0) {
    return `${years} ${years === 1 ? 'Año' : 'Años'}`;
  }
  return `${months} ${months === 1 ? 'Mes' : 'Meses'}`;
}

function calculateBirthDate(ageStr: string): string | null {
  const now = new Date();
  const match = ageStr.match(/(\d+)\s*(año|mes)/i);
  if (!match) return null;
  const val = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  if (unit.startsWith('año')) {
    now.setFullYear(now.getFullYear() - val);
  } else if (unit.startsWith('mes')) {
    now.setMonth(now.getMonth() - val);
  }
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

export default function Mascotas() {
  const supabase = createClient();

  // Page states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('Todas');
  const [selectedBreed, setSelectedBreed] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // New Pet Form state
  const [newName, setNewName] = useState('');
  const [newSpecies, setNewSpecies] = useState<'Caninos' | 'Felinos' | 'Exóticos'>('Caninos');
  const [newBreed, setNewBreed] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newStatus, setNewStatus] = useState<'Saludable' | 'En Observación' | 'En Tratamiento' | 'Crítico'>('Saludable');

  // Pets state
  const [pets, setPets] = useState<Pet[]>([]);

  const [recentRegistrations] = useState<RecentRegistration[]>([
    {
      id: 'r1',
      name: 'Bella',
      owner: 'Carlos Ruiz',
      date: 'Hoy, 10:30 AM',
      status: 'Activo',
      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: 'r2',
      name: 'Thor',
      owner: 'Marta García',
      date: 'Ayer, 04:15 PM',
      status: 'Activo',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200&auto=format&fit=crop'
    }
  ]);

  const [vaccines] = useState<VaccineReminder[]>([
    {
      id: 'v1',
      petName: 'Maximus',
      vaccine: 'Rabia',
      dueText: 'Vence en 3 días',
      type: 'urgent'
    },
    {
      id: 'v2',
      petName: 'Luna',
      vaccine: 'Desparasitación',
      dueText: 'Próximo Lunes',
      type: 'upcoming'
    }
  ]);

  // Load pets from Supabase on mount
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUser(user);

        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setProfile(userProfile);

        let query = supabase.from('pets').select('*');
        if (userProfile?.role === 'owner') {
          query = query.eq('owner_id', user.id);
        }

        const { data: petsData, error } = await query;
        if (petsData) {
          const mappedPets: Pet[] = petsData.map(p => ({
            id: p.id,
            name: p.name,
            species: p.species === 'Felinos' || p.species === 'cat' ? 'Felinos' : p.species === 'Exóticos' || p.species === 'exotic' ? 'Exóticos' : 'Caninos',
            breed: p.breed || 'Desconocida',
            age: calculateAge(p.birth_date),
            weight: p.weight ? `${p.weight} kg` : 'Sin peso',
            status: (p.medical_notes as Pet['status']) || 'Saludable',
            image: p.avatar_url || (p.species === 'Felinos' || p.species === 'cat' ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=200&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200&auto=format&fit=crop')
          }));
          setPets(mappedPets);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle registering a new pet
  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newBreed || !newWeight || !currentUser) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    setSubmitting(true);

    // Use a default placeholder image based on species
    let image = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400';
    if (newSpecies === 'Felinos') {
      image = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400';
    } else if (newSpecies === 'Exóticos') {
      image = 'https://images.unsplash.com/photo-1507666480287-c11226b9f27d?w=400';
    }

    const cleanWeight = parseFloat(newWeight.replace(/[^\d.]/g, '')) || 0;

    const insertData: any = {
      name: newName,
      species: newSpecies,
      breed: newBreed,
      weight: cleanWeight,
      medical_notes: newStatus,
      avatar_url: image,
      owner_id: currentUser.id,  // siempre asignar al usuario actual
    };

    // Solo agregar birth_date si el usuario ingresó la edad
    if (newAge.trim()) {
      insertData.birth_date = calculateBirthDate(newAge);
    }

    const { data: newPetData, error } = await supabase
      .from('pets')
      .insert(insertData)
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      console.error('Error inserting pet:', error);
      alert('Error al agregar mascota: ' + error.message);
      return;
    }

    if (newPetData) {
      const addedPet: Pet = {
        id: newPetData.id,
        name: newPetData.name,
        species: newPetData.species as Pet['species'],
        breed: newPetData.breed || '',
        age: calculateAge(newPetData.birth_date),
        weight: `${newPetData.weight} kg`,
        status: (newPetData.medical_notes as Pet['status']) || 'Saludable',
        image: newPetData.avatar_url || image
      };
      setPets([addedPet, ...pets]);
    }

    // Limpiar formulario y cerrar modal
    setNewName('');
    setNewBreed('');
    setNewAge('');
    setNewWeight('');
    setNewStatus('Saludable');
    setIsAddModalOpen(false);
  };

  // Filtering logic
  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pet.breed.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecies = selectedSpecies === 'Todas' || pet.species === selectedSpecies;
    const matchesBreed = selectedBreed === 'Todas' || pet.breed === selectedBreed;
    const matchesStatus = selectedStatus === 'Todos' || pet.status === selectedStatus;

    return matchesSearch && matchesSpecies && matchesBreed && matchesStatus;
  });

  const getStatusColor = (status: Pet['status']) => {
    switch (status) {
      case 'Saludable':
        return 'bg-secondary shadow-[0_0_8px_rgba(0,108,73,0.4)]';
      case 'En Observación':
      case 'Crítico':
        return 'bg-error shadow-[0_0_8px_rgba(186,26,26,0.4)]';
      case 'En Tratamiento':
        return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]';
      default:
        return 'bg-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h2 className="font-headline-lg text-[28px] md:text-[32px] text-primary tracking-tight font-bold">Directorio de Mascotas</h2>
          <p className="text-on-surface-variant font-body-lg text-sm md:text-base mt-1">Gestiona el censo actual de pacientes clínicos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-surface-container rounded-lg border border-outline-variant">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 font-label-md text-sm transition-all ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: viewMode === 'grid' ? "'FILL' 1" : undefined }}>grid_view</span>
              Cuadrícula
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 font-label-md text-sm transition-all ${
                viewMode === 'list' ? 'bg-white shadow-sm text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: viewMode === 'list' ? "'FILL' 1" : undefined }}>view_list</span>
              Lista
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              console.log('Abriendo modal de mascota...');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-container transition-all active:scale-95 shadow-md text-sm cursor-pointer"
          >
            <span className="material-symbols-outlined">add</span>
            Agregar Mascota
          </button>
        </div>
      </div>

      {/* Filters & Search Section */}
      <section className="flex flex-col md:flex-row flex-wrap items-center gap-4 p-4 bg-white/70 backdrop-blur-md border border-outline-variant/40 rounded-2xl">
        <div className="w-full md:w-auto flex items-center gap-2 border-b md:border-b-0 md:border-r border-outline-variant pb-2 md:pb-0 md:pr-4">
          <span className="text-on-surface-variant font-medium text-sm">Filtrar:</span>
        </div>
        <div className="w-full md:w-auto flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre o raza..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-outline-variant/85 text-sm bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
          />
          <select
            value={selectedSpecies}
            onChange={(e) => setSelectedSpecies(e.target.value)}
            className="bg-transparent border border-outline-variant/80 rounded-lg px-2 py-1.5 text-on-surface text-sm cursor-pointer hover:text-primary outline-none"
          >
            <option value="Todas">Especie: Todas</option>
            <option value="Caninos">Caninos</option>
            <option value="Felinos">Felinos</option>
            <option value="Exóticos">Exóticos</option>
          </select>
          <select
            value={selectedBreed}
            onChange={(e) => setSelectedBreed(e.target.value)}
            className="bg-transparent border border-outline-variant/80 rounded-lg px-2 py-1.5 text-on-surface text-sm cursor-pointer hover:text-primary outline-none"
          >
            <option value="Todas">Raza: Todas</option>
            <option value="Golden Retriever">Golden Retriever</option>
            <option value="Siamés">Siamés</option>
            <option value="Bulldog Francés">Bulldog Francés</option>
            <option value="Samoyedo">Samoyedo</option>
            <option value="Border Collie">Border Collie</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-transparent border border-outline-variant/80 rounded-lg px-2 py-1.5 text-on-surface text-sm cursor-pointer hover:text-primary outline-none"
          >
            <option value="Todos">Estado: Todos</option>
            <option value="Saludable">Saludable</option>
            <option value="En Observación">En Observación</option>
            <option value="En Tratamiento">En Tratamiento</option>
            <option value="Crítico">Crítico</option>
          </select>
        </div>
        <div className="ml-auto text-on-surface-variant text-sm font-medium">
          <span className="font-bold text-primary">{filteredPets.length}</span> Mascotas encontradas
        </div>
      </section>

      {/* Grid or List of Pets */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPets.map((pet) => (
            <div
              key={pet.id}
              className="pet-card bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/30 flex flex-col items-center text-center relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="absolute top-4 right-4">
                <span className={`flex h-3 w-3 rounded-full ${getStatusColor(pet.status)}`} title={pet.status}></span>
              </div>
              <div className="relative mb-4 group-hover:scale-105 transition-transform duration-300">
                <div className="absolute -inset-1 bg-gradient-to-tr from-secondary-fixed to-primary-fixed rounded-full blur opacity-20"></div>
                <img
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg relative z-10"
                  alt={pet.name}
                  src={pet.image}
                />
              </div>
              <h3 className="font-semibold text-lg text-primary mb-1">{pet.name}</h3>
              <p className="text-on-surface-variant text-sm mb-4">{pet.breed}</p>
              <div className="w-full grid grid-cols-2 gap-2 mt-auto">
                <div className="bg-surface-container-low p-2 rounded-xl">
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Edad</p>
                  <p className="font-semibold text-xs text-on-surface">{pet.age}</p>
                </div>
                <div className="bg-surface-container-low p-2 rounded-xl">
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Peso</p>
                  <p className="font-semibold text-xs text-on-surface">{pet.weight}</p>
                </div>
              </div>
              <Link href={`/mascotas/${pet.id}`} className="block text-center mt-6 w-full py-2 border border-outline-variant hover:border-primary hover:text-primary rounded-xl text-sm font-semibold transition-all cursor-pointer">
                Ver Historial
              </Link>
            </div>
          ))}
          {/* Add New Pet Placeholder */}
          <div
            onClick={() => setIsAddModalOpen(true)}
            className="pet-card border-2 border-dashed border-outline-variant hover:border-primary/50 bg-surface-container/20 hover:bg-surface-container-low p-6 rounded-[2rem] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group"
          >
            <div className="w-16 h-16 rounded-full bg-surface-container-high group-hover:bg-primary-fixed flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-all duration-300 mb-4">
              <span className="material-symbols-outlined text-3xl">add</span>
            </div>
            <h3 className="font-semibold text-lg text-on-surface-variant group-hover:text-primary">Registrar Nueva</h3>
            <p className="text-on-surface-variant text-sm mt-1">Ingresa una mascota al sistema</p>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/50 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/80">
                <th className="px-6 py-4 font-bold text-on-surface-variant text-sm">Paciente</th>
                <th className="px-6 py-4 font-bold text-on-surface-variant text-sm">Especie / Raza</th>
                <th className="px-6 py-4 font-bold text-on-surface-variant text-sm">Edad</th>
                <th className="px-6 py-4 font-bold text-on-surface-variant text-sm">Peso</th>
                <th className="px-6 py-4 font-bold text-on-surface-variant text-sm">Estado</th>
                <th className="px-6 py-4 font-bold text-on-surface-variant text-sm text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filteredPets.map((pet) => (
                <tr key={pet.id} className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img className="w-10 h-10 rounded-full object-cover border border-outline-variant" src={pet.image} alt={pet.name} />
                    <span className="font-bold text-primary">{pet.name}</span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant text-sm">
                    {pet.species} • {pet.breed}
                  </td>
                  <td className="px-6 py-4 text-on-surface text-sm">{pet.age}</td>
                  <td className="px-6 py-4 text-on-surface text-sm">{pet.weight}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(pet.status)}`}></span>
                      <span className="text-on-surface text-sm">{pet.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/mascotas/${pet.id}`} className="px-4 py-1.5 border border-outline-variant hover:border-primary hover:text-primary rounded-lg text-sm font-semibold transition-all cursor-pointer">
                      Ver Historial
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CRM Recent Activity & Reminders Section */}
      {profile?.role === 'vet' && (
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h4 className="font-bold text-xl text-primary mb-6">Altas Recientes</h4>
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/60 shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/60">
                  <th className="px-6 py-4 font-bold text-on-surface-variant text-sm">Mascota</th>
                  <th className="px-6 py-4 font-bold text-on-surface-variant text-sm">Dueño</th>
                  <th className="px-6 py-4 font-bold text-on-surface-variant text-sm">Fecha Registro</th>
                  <th className="px-6 py-4 font-bold text-on-surface-variant text-sm">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {recentRegistrations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img className="w-8 h-8 rounded-full object-cover" src={rec.image} alt={rec.name} />
                      <span className="font-semibold text-on-surface">{rec.name}</span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant text-sm">{rec.owner}</td>
                    <td className="px-6 py-4 text-on-surface-variant text-sm">{rec.date}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase rounded-full">
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-xl text-primary mb-6">Recordatorios de Vacunas</h4>
          <div className="flex flex-col gap-4">
            {vaccines.map((vax) => (
              <div
                key={vax.id}
                className={`p-4 rounded-2xl border-l-4 flex gap-4 items-start ${
                  vax.type === 'urgent'
                    ? 'bg-surface-container border-secondary'
                    : 'bg-surface-container border-amber-400'
                }`}
              >
                <div className={`p-2 rounded-lg ${vax.type === 'urgent' ? 'bg-secondary-container text-on-secondary-container' : 'bg-amber-100 text-amber-700'}`}>
                  <span className="material-symbols-outlined">vaccines</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface text-sm">{vax.petName} ({vax.vaccine})</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{vax.dueText}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Add Pet Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-lg p-8 rounded-2xl shadow-xl border border-outline-variant/60 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-2xl text-primary">Registrar Nueva Mascota</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddPet} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="name">Nombre</label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Ej: Bobby"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="species">Especie</label>
                  <select
                    id="species"
                    value={newSpecies}
                    onChange={(e) => setNewSpecies(e.target.value as Pet['species'])}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm text-on-surface cursor-pointer"
                  >
                    <option value="Caninos">Caninos</option>
                    <option value="Felinos">Felinos</option>
                    <option value="Exóticos">Exóticos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="breed">Raza</label>
                  <input
                    id="breed"
                    type="text"
                    required
                    placeholder="Ej: Boxer"
                    value={newBreed}
                    onChange={(e) => setNewBreed(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="age">Edad</label>
                  <input
                    id="age"
                    type="text"
                    required
                    placeholder="Ej: 3 Años o 6 Meses"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="weight">Peso (kg)</label>
                  <input
                    id="weight"
                    type="text"
                    required
                    placeholder="Ej: 14.5"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="status">Estado Clínico</label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Pet['status'])}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm text-on-surface cursor-pointer"
                >
                  <option value="Saludable">Saludable</option>
                  <option value="En Observación">En Observación</option>
                  <option value="En Tratamiento">En Tratamiento</option>
                  <option value="Crítico">Crítico</option>
                </select>
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
                  disabled={submitting}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary rounded-xl text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
