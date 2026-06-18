"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AdminDashboard() {
  const supabase = createClient();
  const [metrics, setMetrics] = useState({
    users: 0,
    pets: 0,
    appointments: 0,
    clinics: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [
          { count: usersCount },
          { count: petsCount },
          { count: apptsCount },
          { count: clinicsCount }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'owner'),
          supabase.from('pets').select('*', { count: 'exact', head: true }),
          supabase.from('appointments').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'vet')
        ]);

        setMetrics({
          users: usersCount || 0,
          pets: petsCount || 0,
          appointments: apptsCount || 0,
          clinics: clinicsCount || 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Global</h1>
        <p className="text-slate-400 mt-2">Visión general del estado de Vetsync.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI Card 1 */}
        <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/30">
              <span className="material-symbols-outlined text-3xl">domain</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Clínicas (Vets)</p>
              <h2 className="text-4xl font-black text-white">{metrics.clinics}</h2>
            </div>
          </div>
        </div>

        {/* KPI Card 2 */}
        <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30">
              <span className="material-symbols-outlined text-3xl">groups</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Dueños (Owners)</p>
              <h2 className="text-4xl font-black text-white">{metrics.users}</h2>
            </div>
          </div>
        </div>

        {/* KPI Card 3 */}
        <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/30">
              <span className="material-symbols-outlined text-3xl">pets</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Mascotas Total</p>
              <h2 className="text-4xl font-black text-white">{metrics.pets}</h2>
            </div>
          </div>
        </div>

        {/* KPI Card 4 */}
        <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/30">
              <span className="material-symbols-outlined text-3xl">calendar_month</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Citas Generadas</p>
              <h2 className="text-4xl font-black text-white">{metrics.appointments}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* System Status Mock */}
      <div className="bg-[#1e293b] border border-slate-700/50 p-8 rounded-3xl shadow-lg">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400">dns</span>
          Estado del Sistema
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="font-bold text-slate-300">Base de Datos Supabase</span>
            </div>
            <span className="text-emerald-400 text-sm font-mono bg-emerald-400/10 px-3 py-1 rounded-full">Operativo</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="font-bold text-slate-300">Servidores Vercel</span>
            </div>
            <span className="text-emerald-400 text-sm font-mono bg-emerald-400/10 px-3 py-1 rounded-full">Operativo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
