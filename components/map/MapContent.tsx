"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom modern icon for clinics
const customClinicIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div class="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center border-[3px] border-white shadow-xl" style="box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3);">
          <span class="material-symbols-outlined" style="font-size: 24px;">local_hospital</span>
        </div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48]
});

interface Clinic {
  id: string;
  clinic_name: string;
  address: string;
  city: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  avgRating?: number;
  reviewCount?: number;
}

export default function MapContent({ clinics }: { clinics: Clinic[] }) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full h-full min-h-[500px] bg-surface-container-low animate-pulse rounded-3xl" />;

  const centerPosition: [number, number] = [14.0306, -83.3858]; // Bilwi / Puerto Cabezas

  return (
    <div className="w-full h-[600px] rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl relative z-0">
      <MapContainer 
        center={centerPosition} 
        zoom={14} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          maxZoom={20}
        />

        {clinics
          .filter((clinic) => clinic.latitude !== null && clinic.longitude !== null)
          .map((clinic) => {
            return (
              <Marker key={clinic.id} position={[clinic.latitude!, clinic.longitude!]} icon={customClinicIcon}>
                <Popup className="rounded-xl overflow-hidden shadow-md">
                  <div className="p-1 min-w-[200px]">
                    <h3 className="font-bold text-primary text-base mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">local_hospital</span>
                      {clinic.clinic_name}
                    </h3>
                    
                    {clinic.reviewCount !== undefined && clinic.reviewCount > 0 ? (
                      <div className="flex items-center gap-1 text-xs mb-1.5">
                        <span className="material-symbols-outlined text-[14px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-bold text-on-surface">{clinic.avgRating}</span>
                        <span className="text-on-surface-variant font-medium">({clinic.reviewCount} {clinic.reviewCount === 1 ? 'reseña' : 'reseñas'})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-on-surface-variant/80 mb-1.5 font-medium">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        <span>Sin calificaciones</span>
                      </div>
                    )}
                    
                    <p className="text-xs text-on-surface-variant font-semibold mb-2">{clinic.city}</p>
                    
                    <div className="bg-surface-container-low p-2 rounded-lg mb-2">
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Dirección por referencia</p>
                      <p className="text-sm font-medium text-on-surface">{clinic.address || 'No especificada'}</p>
                    </div>
                    
                    {clinic.description && (
                      <p className="text-xs text-on-surface-variant italic mb-2">"{clinic.description}"</p>
                    )}
                    
                    <button 
                      onClick={() => router.push(`/citas?clinicId=${clinic.id}`)}
                      className="w-full mt-2 bg-primary text-white py-1.5 rounded-lg text-xs font-bold hover:bg-primary-container transition-colors"
                    >
                      Solicitar Cita Aquí
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}
