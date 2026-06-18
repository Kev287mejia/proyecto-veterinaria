"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function Reportes() {
  const supabase = createClient();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalClients: 0,
    totalPets: 0,
    totalAppointments: 0,
    totalProducts: 0
  });

  const [appointmentData, setAppointmentData] = useState<any[]>([]);
  const [petData, setPetData] = useState<any[]>([]);
  
  useEffect(() => {
    async function loadData() {
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

        // Fetch Metrics concurrently
        const [
          { count: clientsCount },
          { count: petsCount, data: petsRawData },
          { count: apptsCount, data: apptsRawData },
          { count: productsCount }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'owner'),
          supabase.from('pets').select('breed'),
          supabase.from('appointments').select('status'),
          supabase.from('products').select('*', { count: 'exact', head: true })
        ]);

        setMetrics({
          totalClients: clientsCount || 0,
          totalPets: petsCount || (petsRawData?.length || 0),
          totalAppointments: apptsCount || (apptsRawData?.length || 0),
          totalProducts: productsCount || 0
        });

        // Process Appointments Data for Chart
        if (apptsRawData) {
          const statusCounts = apptsRawData.reduce((acc: any, appt) => {
            acc[appt.status] = (acc[appt.status] || 0) + 1;
            return acc;
          }, {});

          const formattedApptData = [
            { name: 'Pendientes', cantidad: statusCounts['pending'] || 0, fill: '#ffc107' },
            { name: 'Confirmadas', cantidad: statusCounts['confirmed'] || 0, fill: '#0ea5e9' },
            { name: 'Completadas', cantidad: statusCounts['completed'] || 0, fill: '#10b981' },
            { name: 'Canceladas', cantidad: statusCounts['cancelled'] || 0, fill: '#ef4444' }
          ];
          setAppointmentData(formattedApptData);
        }

        // Process Pets Data for Pie Chart (Mocking Species since we only have breed)
        // If breed contains 'Gato' or 'Felino', we say Gato, else Perro for now.
        if (petsRawData) {
          let perros = 0;
          let gatos = 0;
          let otros = 0;

          petsRawData.forEach(p => {
            const breed = (p.breed || '').toLowerCase();
            if (breed.includes('gato') || breed.includes('felino') || breed.includes('siames') || breed.includes('persa')) {
              gatos++;
            } else if (breed.includes('ave') || breed.includes('pajaro')) {
              otros++;
            } else {
              perros++; // Default to Perro since most are dogs
            }
          });

          setPetData([
            { name: 'Perros', value: perros, color: '#0ea5e9' },
            { name: 'Gatos', value: gatos, color: '#f59e0b' },
            { name: 'Otros', value: otros, color: '#8b5cf6' }
          ].filter(item => item.value > 0)); // Only show if greater than 0
        }

      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-display-sm font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-4xl text-primary">bar_chart</span>
          Dashboard de Reportes
        </h2>
        <p className="text-on-surface-variant mt-1">Métricas y estadísticas en tiempo real de tu clínica.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/60 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">group</span>
          </div>
          <div>
            <p className="text-on-surface-variant font-bold text-sm uppercase tracking-wider">Total Clientes</p>
            <p className="text-3xl font-bold text-on-surface">{metrics.totalClients}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/60 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">pets</span>
          </div>
          <div>
            <p className="text-on-surface-variant font-bold text-sm uppercase tracking-wider">Total Mascotas</p>
            <p className="text-3xl font-bold text-on-surface">{metrics.totalPets}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/60 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">calendar_today</span>
          </div>
          <div>
            <p className="text-on-surface-variant font-bold text-sm uppercase tracking-wider">Citas Históricas</p>
            <p className="text-3xl font-bold text-on-surface">{metrics.totalAppointments}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/60 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">inventory_2</span>
          </div>
          <div>
            <p className="text-on-surface-variant font-bold text-sm uppercase tracking-wider">Productos Tienda</p>
            <p className="text-3xl font-bold text-on-surface">{metrics.totalProducts}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart: Appointments */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/60 shadow-sm flex flex-col h-96">
          <h3 className="font-bold text-lg text-on-surface mb-6">Estado de Citas</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="cantidad" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Pets */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/60 shadow-sm flex flex-col h-96">
          <h3 className="font-bold text-lg text-on-surface mb-6">Distribución de Pacientes</h3>
          <div className="flex-1 w-full flex items-center justify-center relative">
            {petData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={petData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {petData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-on-surface-variant">No hay datos suficientes de pacientes.</p>
            )}
            
            {/* Center Label for Pie Chart */}
            {petData.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-8">
                <span className="text-3xl font-bold text-on-surface">{metrics.totalPets}</span>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Pacientes</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
