"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface ClientPet {
  id: string;
  name: string;
  breed: string;
}

interface ClientProfile {
  id: string;
  full_name: string;
  phone: string | null;
  role: string;
  pets: ClientPet[];
}

export default function Clientes() {
  const supabase = createClient();
  const router = useRouter();
  
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    async function loadClients() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: userProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!userProfile || userProfile.role === 'owner') {
          // Bloquear acceso a dueños
          router.push('/');
          return;
        }

        // Fetch clients and their pets
        const { data: clientsData, error } = await supabase
          .from('profiles')
          .select('id, full_name, phone, role, pets(id, name, breed)')
          .eq('role', 'owner')
          .order('full_name', { ascending: true });

        if (error) {
          console.error("Error fetching clients:", error);
        } else if (clientsData) {
          setClients(clientsData as any);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadClients();
  }, [router]);

  const filteredClients = clients.filter(c => 
    (c.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone || '').includes(searchQuery)
  );

  // Array de colores pasteles para los avatares
  const avatarColors = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200'
  ];

  const getInitials = (name: string) => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getColorClass = (id: string) => {
    // Generar un color consistente basado en el ID
    const charCode = id.charCodeAt(0) || 0;
    return avatarColors[charCode % avatarColors.length];
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Búsqueda */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/50 shadow-sm">
        <div>
          <h2 className="text-display-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-4xl text-primary">groups</span>
            Directorio de Clientes
          </h2>
          <p className="text-on-surface-variant mt-1">Gestiona tu cartera de clientes y sus mascotas.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-2xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const colorClass = getColorClass(client.id);
          return (
            <div key={client.id} className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  {/* Avatar & Info */}
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold border-2 ${colorClass} shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                      {getInitials(client.full_name)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-on-surface truncate pr-2" title={client.full_name}>
                        {client.full_name || 'Cliente sin nombre'}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant text-sm">
                        <span className="material-symbols-outlined text-[16px]">call</span>
                        <span>{client.phone || 'Sin número'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <hr className="my-5 border-outline-variant/40" />

                {/* Pets Summary */}
                <div className="bg-surface-container-low/50 rounded-2xl p-4 border border-outline-variant/30">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-secondary text-xl">pets</span>
                    <span className="font-bold text-sm text-on-surface">Mascotas Registradas ({client.pets?.length || 0})</span>
                  </div>
                  
                  {client.pets && client.pets.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {client.pets.map(pet => (
                        <span key={pet.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors cursor-default shadow-sm">
                          {pet.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant font-medium">Este cliente aún no tiene mascotas registradas.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center bg-surface-container-lowest border border-dashed border-outline-variant rounded-3xl">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 opacity-50">search_off</span>
            <p className="text-lg font-bold text-on-surface-variant">No se encontraron clientes</p>
            <p className="text-sm text-on-surface-variant/80 mt-1">Intenta buscar con otros términos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
