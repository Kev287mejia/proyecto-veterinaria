"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function Sidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [userRole, setUserRole] = useState<'ADMIN' | 'VETERINARIO' | 'CLIENTE'>('CLIENTE');

  useEffect(() => {
    async function loadUserRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin') {
        setUserRole('ADMIN');
      } else if (profile?.role === 'vet') {
        setUserRole('VETERINARIO');
      } else {
        setUserRole('CLIENTE');
      }
    }
    loadUserRole();
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const getLinkClass = (path: string) => {
    const baseClass = "sidebar-item flex items-center gap-3 px-3 py-2 rounded-lg transition-all active:opacity-80 scale-98";
    if (isActive(path)) {
      return `${baseClass} bg-secondary-container text-on-secondary-container font-semibold`;
    }
    return `${baseClass} text-on-surface-variant hover:bg-surface-container-low`;
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 border-r border-outline-variant bg-surface flex flex-col p-4 gap-2 z-50">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <img alt="Vetsync Logo" className="w-8 h-8 object-contain" src="/Vetsync_Logo.png" />
        <div className="flex flex-col">
          <span className="font-headline-lg text-[20px] font-bold text-primary leading-tight">Vetsync</span>
          <span className="text-on-surface-variant text-[10px] uppercase tracking-wider font-semibold">Clínica Veterinaria</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        <Link className={getLinkClass('/')} href="/">
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          <span className="font-label-md text-label-md">Dashboard</span>
        </Link>
        <Link className={getLinkClass('/tienda')} href="/tienda">
          <span className="material-symbols-outlined" data-icon="storefront">storefront</span>
          <span className="font-label-md text-label-md">Tienda</span>
        </Link>
        <Link className={getLinkClass('/citas')} href="/citas">
          <span className="material-symbols-outlined" data-icon="calendar_today">calendar_today</span>
          <span className="font-label-md text-label-md">Citas</span>
        </Link>
        <Link className={getLinkClass('/mascotas')} href="/mascotas">
          <span className="material-symbols-outlined" data-icon="pets">pets</span>
          <span className="font-label-md text-label-md">Mascotas</span>
        </Link>
        {userRole !== 'CLIENTE' && (
          <Link className={getLinkClass('/clientes')} href="/clientes">
            <span className="material-symbols-outlined" data-icon="group">group</span>
            <span className="font-label-md text-label-md">Clientes</span>
          </Link>
        )}

        {userRole !== 'CLIENTE' && (
          <Link className={getLinkClass('/reportes')} href="/reportes">
            <span className="material-symbols-outlined" data-icon="bar_chart">bar_chart</span>
            <span className="font-label-md text-label-md">Reportes</span>
          </Link>
        )}
      </nav>
      <div className="pt-4 border-t border-outline-variant mt-auto flex flex-col gap-1">
        {userRole === 'ADMIN' && (
          <Link className={getLinkClass('/admin')} href="/admin">
            <span className="material-symbols-outlined" data-icon="admin_panel_settings">admin_panel_settings</span>
            <span className="font-label-md text-label-md">Panel Admin</span>
          </Link>
        )}
        <Link className={getLinkClass('/perfil')} href="/perfil">
          <span className="material-symbols-outlined" data-icon="settings">settings</span>
          <span className="font-label-md text-label-md">Configuración</span>
        </Link>
      </div>
    </aside>
  );
}
