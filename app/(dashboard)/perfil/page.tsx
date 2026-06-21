"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function Perfil() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const supabase = createClient();

  const loadProfile = async () => {
    setLoading(true);
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
        setPhone(userProfile.phone || '');
        setAddress(userProfile.address || '');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleDiscard = () => {
    // Reset to initial loaded state
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
    }
    setNewPassword('');
    setConfirmPassword('');
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // Validate passwords if user is trying to change them
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
        setSaving(false);
        return;
      }
      if (newPassword.length < 6) {
        setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
        setSaving(false);
        return;
      }
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // 1. Update Profile (full_name, phone, address)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone: phone, address: address })
        .eq('id', user.id);

      if (profileError) {
        setMessage({ type: 'error', text: 'Error al actualizar la información del perfil' });
        setSaving(false);
        return;
      }

      // 2. Update Password if provided
      if (newPassword) {
        const { error: authError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (authError) {
          setMessage({ type: 'error', text: 'Error al actualizar la contraseña: ' + authError.message });
          setSaving(false);
          return;
        }
      }

      setMessage({ type: 'success', text: 'Perfil actualizado con éxito' });
      setNewPassword('');
      setConfirmPassword('');
      
      // Update local profile state
      setProfile({ ...profile, full_name: fullName, phone: phone, address: address });
    }
    setSaving(false);
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleEditPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;

      // Upload to 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile record
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Optimistic UI update
      setProfile({ ...profile, avatar_url: publicUrl });
      setMessage({ type: 'success', text: 'Foto de perfil actualizada con éxito.' });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      setMessage({ type: 'error', text: 'Error al subir la foto. Asegúrate de que el bucket "avatars" exista.' });
    } finally {
      setSaving(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-64"><span className="text-primary font-semibold">Cargando perfil...</span></div>;
  }

  const roleName = profile?.role === 'vet' ? 'Veterinario / Clínica' : 'Dueño de Mascota';

  return (
    <div className="space-y-8 pb-12 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-headline-lg font-bold text-on-surface">Perfil de Usuario</h1>
        <p className="text-on-surface-variant text-body-lg">Gestiona tu información personal y preferencias.</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex flex-col items-center text-center xl:col-span-1 shadow-sm h-fit relative overflow-hidden">
          <div className="relative mb-4 mt-4">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-32 h-32 rounded-full border-4 border-surface shadow-md object-cover" />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-surface bg-primary-container flex items-center justify-center text-on-primary-container text-5xl shadow-md font-bold">
                {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            <button 
              type="button"
              onClick={handleEditPhoto}
              disabled={saving}
              className="absolute bottom-0 right-0 bg-primary text-on-primary p-2 rounded-full hover:bg-primary-container transition-all shadow-md active:scale-95 disabled:opacity-50" 
              title="Editar foto"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          </div>
          <h2 className="text-title-md font-bold text-on-surface text-xl">{fullName || 'Usuario'}</h2>
          <p className="text-on-surface-variant text-sm mb-6 font-medium">{roleName}</p>

          {/* Quick Stats (Mocked for visual parity with design) */}
          <div className="w-full flex justify-between items-center px-4 py-3 bg-surface-container-low rounded-xl mb-3 border border-outline-variant/30">
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                <span className="text-on-surface-variant text-sm font-semibold">Miembro desde</span>
            </div>
            <span className="text-primary font-bold text-sm">
              {profile?.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear()}
            </span>
          </div>
        </div>
        
        {/* Right Column: Edit Form */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 xl:col-span-2 shadow-sm">
          <h3 className="text-title-md font-semibold text-on-surface mb-6 border-b border-outline-variant/60 pb-4 flex items-center gap-2 text-lg">
            <span className="material-symbols-outlined text-primary text-[24px]">person</span>
            Información Personal
          </h3>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2" htmlFor="full-name">Nombre Completo</label>
                <input 
                  className="w-full px-4 py-3.5 rounded-xl border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface font-medium" 
                  id="full-name" 
                  type="text" 
                  value={fullName}
                  placeholder="Tu nombre completo"
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2" htmlFor="email">Correo Electrónico (No editable)</label>
                <input 
                  className="w-full px-4 py-3.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface-variant outline-none cursor-not-allowed font-medium opacity-80" 
                  id="email" 
                  type="email" 
                  value={email}
                  disabled
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2" htmlFor="phone">Teléfono de Contacto</label>
                <input 
                  className="w-full px-4 py-3.5 rounded-xl border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface font-medium" 
                  id="phone" 
                  type="tel" 
                  value={phone}
                  placeholder="+504 1234-5678"
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2" htmlFor="address">Dirección</label>
                <input 
                  className="w-full px-4 py-3.5 rounded-xl border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface font-medium" 
                  id="address" 
                  type="text" 
                  value={address}
                  placeholder="Tu dirección completa"
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <h3 className="text-title-md font-semibold text-on-surface mt-10 mb-6 border-b border-outline-variant/60 pb-4 flex items-center gap-2 text-lg">
              <span className="material-symbols-outlined text-primary text-[24px]">lock</span>
              Seguridad
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2" htmlFor="new-password">Nueva Contraseña</label>
                <input 
                  className="w-full px-4 py-3.5 rounded-xl border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface font-medium" 
                  id="new-password" 
                  type="password" 
                  placeholder="Dejar en blanco para no cambiar"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2" htmlFor="confirm-password">Confirmar Contraseña</label>
                <input 
                  className="w-full px-4 py-3.5 rounded-xl border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface font-medium" 
                  id="confirm-password" 
                  type="password" 
                  placeholder="Confirmar nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 mt-4 ${message.type === 'success' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
                <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
                {message.text}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-8 mt-4">
              <button 
                type="button" 
                onClick={handleDiscard}
                className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant bg-surface-container border border-outline-variant/50 hover:bg-surface-container-high transition-all active:scale-95"
              >
                Descartar
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="px-8 py-2.5 rounded-xl font-bold bg-primary text-on-primary hover:bg-primary-container transition-all shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">save</span>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
