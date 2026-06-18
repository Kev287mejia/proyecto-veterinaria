"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Header({ onOpenSidebar = () => {} }: { onOpenSidebar?: () => void }) {
  const supabase = createClient();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [roleLabel, setRoleLabel] = useState('');
  // Avatar por defecto: mascota DiceBear (se actualiza con el email real al cargar)
  const [avatarUrl, setAvatarUrl] = useState('https://api.dicebear.com/9.x/thumbs/svg?seed=default&backgroundColor=b6e3f4&shapeColor=0a5b83');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

      // Nombre con fallback robusto
      const rawName =
        (profile?.full_name && profile.full_name.trim()) ||
        (user.user_metadata?.full_name && String(user.user_metadata.full_name).trim()) ||
        null;

      const name = rawName
        ? rawName
        : user.email
          ? user.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          : 'Usuario';

      setDisplayName(name);
      setRoleLabel(profile?.role === 'vet' ? 'Veterinario' : 'Dueño de Mascota');

      // Avatar: mascota única generada por DiceBear basada en el email del usuario
      const seed = encodeURIComponent(user.email ?? 'default');
      setAvatarUrl(`https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc&shapeColor=0a5b83,1c799f,69d2e7`);
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-surface border-b border-outline-variant sticky top-0 z-40">
      {/* Barra de búsqueda y Menú Hamburguesa */}
      <div className="flex-1 flex items-center gap-3">
        <button 
          onClick={onOpenSidebar}
          className="md:hidden p-2 -ml-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="relative w-full max-w-md hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            className="w-full bg-surface-container-low text-on-surface font-body-md pl-10 pr-4 py-2 rounded-full border-none focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
            placeholder="Buscar pacientes, clientes, productos..."
            type="text"
          />
        </div>
      </div>

      {/* Acciones del header */}
      <div className="flex items-center gap-4">
        {/* Notificaciones */}
        <button className="relative p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors active:opacity-80">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface"></span>
        </button>

        {/* Carrito */}
        <Link href="/tienda/carrito" className="relative p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors active:opacity-80">
          <span className="material-symbols-outlined">shopping_cart</span>
        </Link>

        {/* Perfil con menú desplegable */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 cursor-pointer p-1 pr-3 hover:bg-surface-container-low rounded-full transition-colors active:opacity-80"
          >
            <img
              alt="Perfil"
              className="w-8 h-8 rounded-full object-cover border border-outline-variant bg-surface-container-low"
              src={avatarUrl}
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="font-label-md font-bold text-on-surface text-sm leading-tight">
                {displayName || '...'}
              </span>
              <span className="font-label-sm text-on-surface-variant text-[11px]">
                {roleLabel || '...'}
              </span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant hidden md:block">
              arrow_drop_down
            </span>
          </button>

          {/* Menú desplegable */}
          {menuOpen && (
            <div className="absolute right-0 top-12 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-2 z-50">
              <Link
                href="/perfil"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-base">person</span>
                Mi Perfil
              </Link>
              <hr className="my-1 border-outline-variant/50" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error-container/30 transition-colors"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cerrar menú al hacer click fuera */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </header>
  );
}
