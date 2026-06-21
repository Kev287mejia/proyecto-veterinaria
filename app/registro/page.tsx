"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function Registro() {
  const [role, setRole] = useState<'owner' | 'vet'>('owner');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user) {
      // Guardar el perfil directamente en la tabla profiles
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: name,
        role: role,
        phone: phone,
        address: address,
      });
      router.push('/login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-surface">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <h2 className="font-headline-lg text-[24px] font-bold text-primary mt-2">Crear una cuenta</h2>
          <p className="text-on-surface-variant text-sm mt-1 text-center">
            {role === 'vet' 
              ? 'Únete a Vetsync para gestionar tu clínica' 
              : 'Únete a Vetsync para cuidar mejor de tu mascota'}
          </p>
        </div>
        
        <div className="flex p-1 mb-6 bg-surface-variant rounded-lg">
          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
              role === 'owner' 
                ? 'bg-surface-container-lowest text-primary shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Dueño de Mascota
          </button>
          <button
            type="button"
            onClick={() => setRole('vet')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
              role === 'vet' 
                ? 'bg-surface-container-lowest text-primary shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Veterinario / Clínica
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2" htmlFor="name">Nombre Completo</label>
            <input 
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none text-on-surface" 
              id="name" 
              type="text" 
              placeholder="Carlos Hodgson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2" htmlFor="email">Correo Electrónico</label>
            <input 
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none text-on-surface" 
              id="email" 
              type="email" 
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2" htmlFor="phone">Teléfono</label>
            <input 
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none text-on-surface" 
              id="phone" 
              type="tel" 
              placeholder="+505 8123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2" htmlFor="address">Dirección</label>
            <input 
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none text-on-surface" 
              id="address" 
              type="text" 
              placeholder="Barrio Peter Ferrera, del Muelle 2c al Norte"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2" htmlFor="password">Contraseña</label>
            <input 
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none text-on-surface" 
              id="password" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2" htmlFor="confirm-password">Confirmar Contraseña</label>
            <input 
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-colors outline-none text-on-surface" 
              id="confirm-password" 
              type="password" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div className="text-error text-sm mt-2">{error}</div>}
          
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <span className="text-sm text-on-surface-variant">¿Ya tienes una cuenta?</span>
          <Link href="/login" className="text-sm font-semibold text-primary hover:text-primary-container transition-colors ml-1">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
