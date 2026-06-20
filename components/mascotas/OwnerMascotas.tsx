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

export default function OwnerMascotas({ userId }: { userId: string }) {
  const supabase = createClient();

  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Pet Form state
  const [newName, setNewName] = useState('');
  const [newSpecies, setNewSpecies] = useState<'Caninos' | 'Felinos' | 'Exóticos'>('Caninos');
  const [newBreed, setNewBreed] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: petsData } = await supabase
          .from('pets')
          .select('*')
          .eq('owner_id', userId);

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
  }, [userId]);

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newBreed || !newWeight) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    setSubmitting(true);

    let image = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400';
    if (newSpecies === 'Felinos') {
      image = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400';
    } else if (newSpecies === 'Exóticos') {
      image = 'https://images.unsplash.com/photo-1507666480287-c11226b9f27d?w=400';
    }

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile);
      
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        image = publicUrlData.publicUrl;
      } else {
        console.error('Error uploading image:', uploadError);
        alert('Hubo un problema subiendo la imagen, pero la mascota será registrada con una imagen por defecto.');
      }
    }

    const cleanWeight = parseFloat(newWeight.replace(/[^\d.]/g, '')) || 0;

    const insertData: any = {
      name: newName,
      species: newSpecies,
      breed: newBreed,
      weight: cleanWeight,
      medical_notes: 'Saludable', // Owners always add healthy pets by default
      avatar_url: image,
      owner_id: userId,
    };

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
        status: 'Saludable',
        image: newPetData.avatar_url || image
      };
      setPets([addedPet, ...pets]);
    }

    setNewName('');
    setNewBreed('');
    setNewAge('');
    setNewWeight('');
    setAvatarFile(null);
    setIsAddModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Actions Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="font-headline-lg text-[28px] md:text-[32px] text-primary tracking-tight font-bold">Mis Mascotas</h2>
          <p className="text-on-surface-variant font-body-lg text-sm md:text-base mt-1">
            Gestiona la información y cartillas digitales de tus compañeros.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-2xl font-bold hover:bg-primary-container transition-all active:scale-95 shadow-md text-sm cursor-pointer"
        >
          <span className="material-symbols-outlined">pets</span>
          Registrar Mascota
        </button>
      </div>

      {/* Grid of Pets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pets.map((pet) => (
          <div
            key={pet.id}
            className="pet-card bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/30 flex flex-col items-center text-center relative overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <div className="relative mb-4 group-hover:scale-105 transition-transform duration-300 mt-2">
              <div className="absolute -inset-1 bg-gradient-to-tr from-secondary-fixed to-primary-fixed rounded-full blur opacity-20"></div>
              <img
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md relative z-10"
                alt={pet.name}
                src={pet.image}
              />
            </div>
            <h3 className="font-bold text-xl text-primary mb-1">{pet.name}</h3>
            <p className="text-on-surface-variant text-sm mb-5 font-medium">{pet.breed}</p>
            <div className="w-full grid grid-cols-2 gap-3 mt-auto">
              <div className="bg-surface-container-low/50 p-3 rounded-2xl border border-outline-variant/20">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Edad</p>
                <p className="font-semibold text-xs text-on-surface">{pet.age}</p>
              </div>
              <div className="bg-surface-container-low/50 p-3 rounded-2xl border border-outline-variant/20">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Peso</p>
                <p className="font-semibold text-xs text-on-surface">{pet.weight}</p>
              </div>
            </div>
            <Link href={`/mascotas/${pet.id}`} className="block text-center mt-6 w-full py-3 bg-surface-container-low text-primary hover:bg-primary hover:text-white rounded-xl text-sm font-bold transition-colors cursor-pointer">
              Ver Cartilla Digital
            </Link>
          </div>
        ))}

        {pets.length === 0 && (
          <div
            onClick={() => setIsAddModalOpen(true)}
            className="col-span-full border-2 border-dashed border-outline-variant hover:border-primary/50 bg-surface-container/20 hover:bg-surface-container-low p-12 rounded-[2rem] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group"
          >
            <div className="w-20 h-20 rounded-full bg-surface-container-high group-hover:bg-primary-fixed flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-all duration-300 mb-4">
              <span className="material-symbols-outlined text-4xl">add</span>
            </div>
            <h3 className="font-bold text-xl text-on-surface-variant group-hover:text-primary mb-2">Registrar Primera Mascota</h3>
            <p className="text-on-surface-variant text-sm max-w-sm">No tienes mascotas registradas. Añade a tu primer compañero para llevar su control de vacunas y citas.</p>
          </div>
        )}
      </div>

      {/* Add Pet Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-lg p-8 rounded-3xl shadow-2xl border border-outline-variant/60 animate-in fade-in zoom-in-95 duration-200 bg-surface-container-lowest">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-2xl text-primary">Añadir a mi Mascota</h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setAvatarFile(null);
                }}
                className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddPet} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1.5" htmlFor="name">Nombre</label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Ej: Bobby"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1.5" htmlFor="species">Especie</label>
                  <select
                    id="species"
                    value={newSpecies}
                    onChange={(e) => setNewSpecies(e.target.value as Pet['species'])}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm text-on-surface cursor-pointer"
                  >
                    <option value="Caninos">Perro</option>
                    <option value="Felinos">Gato</option>
                    <option value="Exóticos">Exótico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1.5" htmlFor="breed">Raza</label>
                  <input
                    id="breed"
                    type="text"
                    required
                    placeholder="Ej: Boxer, Mestizo..."
                    value={newBreed}
                    onChange={(e) => setNewBreed(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1.5" htmlFor="age">Edad</label>
                  <input
                    id="age"
                    type="text"
                    required
                    placeholder="Ej: 3 Años o 6 Meses"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1.5" htmlFor="weight">Peso (kg)</label>
                  <input
                    id="weight"
                    type="text"
                    required
                    placeholder="Ej: 14.5"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1.5" htmlFor="photo">Foto (Opcional)</label>
                <input
                  id="photo"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAvatarFile(e.target.files[0]);
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm text-on-surface cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>

              <div className="flex gap-3 justify-end pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setAvatarFile(null);
                  }}
                  className="px-6 py-3 border border-outline-variant hover:bg-surface-container-low rounded-xl text-sm font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-primary hover:bg-primary-container text-on-primary rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Guardando...' : 'Registrar Mascota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
