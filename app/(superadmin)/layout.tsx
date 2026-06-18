"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('Cargando...');

  useEffect(() => {
    async function verifyAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/admin-login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/admin-login');
      } else {
        setUserName(profile.full_name || 'Admin');
        setLoading(false);
      }
    }
    verifyAdmin();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin-login');
  };

  const isActive = (path: string) => pathname === path;

  const getLinkClass = (path: string) => {
    const baseClass = "sidebar-item flex items-center gap-3 px-3 py-2 rounded-lg transition-all active:opacity-80 scale-98";
    if (isActive(path)) {
      return `${baseClass} bg-secondary-container text-on-secondary-container font-semibold`;
    }
    return `${baseClass} text-on-surface-variant hover:bg-surface-container-low`;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-surface items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface text-on-surface font-sans">
      {/* Sidebar Claro (Standard) */}
      <aside className="h-screen w-64 fixed left-0 top-0 border-r border-outline-variant bg-surface flex flex-col p-4 gap-2 z-50">
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">
          <Image alt="Vetsync Logo" width={32} height={32} className="object-contain" src="/Vetsync_Logo.png" />
          <div className="flex flex-col">
            <span className="font-headline-lg text-[20px] font-bold text-primary leading-tight">Vetsync</span>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-wider font-semibold">Panel de Control</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <Link className={getLinkClass('/admin-dashboard')} href="/admin-dashboard">
            <span className="material-symbols-outlined" data-icon="monitoring">monitoring</span>
            <span className="font-label-md text-label-md">Global</span>
          </Link>
          <Link className={getLinkClass('/admin-users')} href="/admin-users">
            <span className="material-symbols-outlined" data-icon="manage_accounts">manage_accounts</span>
            <span className="font-label-md text-label-md">Cuentas</span>
          </Link>
          <Link className={getLinkClass('/admin-clinics')} href="/admin-clinics">
            <span className="material-symbols-outlined" data-icon="domain">domain</span>
            <span className="font-label-md text-label-md">Clínicas</span>
          </Link>
        </nav>

        <div className="pt-4 border-t border-outline-variant mt-auto flex flex-col gap-1">
          <button 
            onClick={handleLogout}
            className="sidebar-item flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-error hover:bg-error-container/30 w-full active:opacity-80 scale-98"
          >
            <span className="material-symbols-outlined" data-icon="logout">logout</span>
            <span className="font-label-md text-label-md font-semibold">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-[72px] bg-surface/80 backdrop-blur-md border-b border-outline-variant flex items-center justify-end px-8 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-on-surface">{userName}</span>
              <span className="text-xs text-primary font-bold tracking-wider uppercase">Súper Administrador</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-container border border-primary/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">shield_person</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-surface">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
