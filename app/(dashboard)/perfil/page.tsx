"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function Perfil() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (userProfile) {
          setProfile(userProfile);
          setFullName(userProfile.full_name || '');
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) {
        setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
      } else {
        setMessage({ type: 'success', text: 'Perfil actualizado con éxito' });
      }
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8">Cargando perfil...</div>;
  }

  const roleName = profile?.role === 'vet' ? 'Veterinario / Clínica' : 'Dueño de Mascota';

  return (
    <div className="space-y-8 pb-12">
      <div className="mb-8">
        <h1 className="text-headline-lg font-bold text-on-surface">Perfil de Usuario</h1>
        <p className="text-on-surface-variant text-body-lg">Gestiona tu información personal y preferencias.</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex flex-col items-center text-center xl:col-span-1 shadow-sm h-fit">
          <div className="relative mb-4 mt-4">
            <div className="w-32 h-32 rounded-full border-4 border-surface-container-lowest bg-primary-container flex items-center justify-center text-on-primary-container text-4xl shadow-md">
              {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
          <h2 className="text-title-md font-bold text-on-surface">{fullName || 'Usuario'}</h2>
          <p className="text-on-surface-variant text-sm mb-6">{roleName}</p>
        </div>
        
        {/* Right Column: Edit Form */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 xl:col-span-2 shadow-sm">
          <h3 className="text-title-md font-semibold text-on-surface mb-6 border-b border-outline-variant pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            Información Personal
          </h3>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2" htmlFor="full-name">Nombre Completo</label>
                <input 
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none text-on-surface" 
                  id="full-name" 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2" htmlFor="email">Correo Electrónico (No editable)</label>
                <input 
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant outline-none cursor-not-allowed" 
                  id="email" 
                  type="email" 
                  value={email}
                  disabled
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
                {message.text}
              </div>
            )}

            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-outline-variant">
              <button 
                type="submit" 
                disabled={saving}
                className="px-6 py-2.5 rounded-lg font-semibold bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
