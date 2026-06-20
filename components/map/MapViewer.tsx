"use client";

import dynamic from 'next/dynamic';

interface Clinic {
  id: string;
  clinic_name: string;
  address: string;
  city: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
}

const DynamicMap = dynamic(() => import('./MapContent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-surface-container-low animate-pulse rounded-[2.5rem] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="material-symbols-outlined text-4xl text-primary animate-bounce">map</span>
        <p className="text-on-surface-variant font-bold">Cargando Mapa de Bilwi...</p>
      </div>
    </div>
  )
});

export default function MapViewer({ clinics }: { clinics: Clinic[] }) {
  return <DynamicMap clinics={clinics} />;
}
