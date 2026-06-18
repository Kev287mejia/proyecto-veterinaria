"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/admin-login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/admin-login');
      } else {
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
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-xl transition-all";
    if (isActive(path)) {
      return `${baseClass} bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30`;
    }
    return `${baseClass} text-slate-400 hover:bg-slate-800 hover:text-slate-200`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans">
      {/* Sidebar Oscuro */}
      <aside className="w-72 bg-[#1e293b] border-r border-slate-800 flex flex-col z-50">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 shadow-inner">
              <span className="material-symbols-outlined text-blue-400">admin_panel_settings</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white leading-tight tracking-tight">Vetsync HQ</span>
              <span className="text-blue-400 text-[10px] uppercase tracking-widest font-bold">Global Control</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link className={getLinkClass('/admin-dashboard')} href="/admin-dashboard">
            <span className="material-symbols-outlined text-xl">monitoring</span>
            <span>Dashboard Global</span>
          </Link>
          <Link className={getLinkClass('/admin-users')} href="/admin-users">
            <span className="material-symbols-outlined text-xl">manage_accounts</span>
            <span>Gestión de Usuarios</span>
          </Link>
          <Link className={getLinkClass('/admin-clinics')} href="/admin-clinics">
            <span className="material-symbols-outlined text-xl">domain</span>
            <span>Clínicas Registradas</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="font-bold">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-[#1e293b]/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-end px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-white">Súper Administrador</span>
              <span className="text-xs text-slate-400">Acceso Total Activo</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined">shield_person</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
