import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Image from 'next/image';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: clinics } = await supabase.from('vet_clinics').select('*').limit(10);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* HEADER (Glassmorphism) */}
      <header className="w-full bg-white/70 backdrop-blur-md border-b border-gray-200/50 py-4 px-6 flex justify-between items-center sticky top-0 z-50 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 relative drop-shadow-sm">
            <Image src="/Vetsync_Logo.png" alt="Vetsync Logo" fill className="object-contain" />
          </div>
          <span className="text-xl font-extrabold text-gray-900 tracking-tight">
            Vetsync <span className="text-primary">Bilwi</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-gray-600 font-medium hover:text-gray-900 transition-colors text-sm sm:text-base">
            Iniciar Sesión
          </Link>
          <Link 
            href="/registro" 
            className="hidden sm:inline-flex items-center justify-center bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm active:scale-95"
          >
            Regístrate
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* BACKGROUND IMAGE WITH REFINED GRADIENT OVERLAY */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/bilwi_aerial.png" 
            alt="Vista aérea de Bilwi, Puerto Cabezas" 
            fill 
            className="object-cover object-center scale-105" 
            priority 
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-gray-900/90 backdrop-blur-[3px]"></div>
        </div>
        
        <div className="relative z-10 px-6 max-w-4xl mx-auto text-center flex flex-col items-center">
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight leading-[1.1] drop-shadow-md text-balance">
            La Mejor Atención Veterinaria en <br className="hidden md:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300 whitespace-nowrap">Puerto Cabezas</span>
          </h1>
          
          <p className="text-gray-300 text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
            Descubre clínicas de confianza, reserva citas al instante y gestiona el historial médico de tu mejor amigo. Todo desde un solo lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <a 
              href="#directorio" 
              className="inline-flex items-center justify-center bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-base hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              Explorar Clínicas
            </a>
            <Link 
              href="/registro" 
              className="inline-flex items-center justify-center bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold text-base hover:bg-white/20 transition-all shadow-lg active:scale-95"
            >
              Soy Dueño de Mascota
            </Link>
          </div>
        </div>
        
        {/* FADE OUT TO NEXT SECTION */}
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#FAFAFA] to-transparent z-10 pointer-events-none"></div>
      </section>

      {/* CLINICS DIRECTORY */}
      <section id="directorio" className="w-full max-w-7xl mx-auto py-24 px-6 relative z-20">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Clínicas en Bilwi</h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            Explora las opciones disponibles en tu ciudad, conoce a los especialistas y agenda una visita rápidamente.
          </p>
        </div>

        {clinics && clinics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clinics.map((clinic) => (
              <div 
                key={clinic.id} 
                className="group flex flex-col bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
              >
                {/* Clinic Header / Image area */}
                <div className="h-48 bg-gray-50 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                  <div className="w-24 h-24 relative group-hover:scale-105 transition-transform duration-500 ease-out opacity-80 drop-shadow-sm">
                    <Image src="/Vetsync_Logo.png" alt="Logo de clínica" fill className="object-contain" />
                  </div>
                  <div className="absolute top-5 right-5 bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10 px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm">
                    Verificada
                  </div>
                </div>
                
                {/* Clinic Content */}
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight line-clamp-1">{clinic.clinic_name}</h3>
                  <div className="flex items-start gap-2 text-gray-500 mb-5">
                    <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">location_on</span>
                    <p className="text-sm line-clamp-2 leading-relaxed">{clinic.address}, {clinic.city}</p>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-8 flex-1 leading-relaxed">
                    {clinic.description || "Servicios veterinarios integrales para el cuidado y bienestar de tus mascotas con atención personalizada."}
                  </p>
                  <Link 
                    href="/login" 
                    className="w-full inline-flex justify-center items-center bg-gray-50 text-gray-900 py-3.5 rounded-2xl font-semibold text-sm hover:bg-primary hover:text-white transition-colors duration-300 group-hover:shadow-sm"
                  >
                    Solicitar Cita
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-200 border-dashed max-w-2xl mx-auto shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[40px] text-gray-400">store_off</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Aún no hay clínicas</h3>
            <p className="text-gray-500 leading-relaxed max-w-sm mx-auto">
              Actualmente no hay clínicas veterinarias registradas en Bilwi. Si eres veterinario, ¡únete a nuestra red!
            </p>
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="w-full bg-white border-y border-gray-100 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">¿Cómo funciona Vetsync?</h2>
            <p className="text-gray-500 text-lg leading-relaxed">Todo lo que necesitas para tu mascota diseñado de forma simple y efectiva.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            <Link href="/registro" className="text-center group block cursor-pointer">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:-translate-y-2 group-hover:shadow-md group-hover:bg-blue-100 transition-all duration-300">
                <span className="material-symbols-outlined text-3xl">person_add</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight group-hover:text-primary transition-colors">1. Crea tu cuenta</h3>
              <p className="text-gray-500 leading-relaxed">Regístrate de forma gratuita y añade a tus mascotas con todos sus datos fundamentales.</p>
            </Link>
            
            <a href="#directorio" className="text-center group block cursor-pointer">
              <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:-translate-y-2 group-hover:shadow-md group-hover:bg-purple-100 transition-all duration-300">
                <span className="material-symbols-outlined text-3xl">calendar_month</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight group-hover:text-primary transition-colors">2. Agenda citas</h3>
              <p className="text-gray-500 leading-relaxed">Elige la clínica de tu preferencia en Bilwi y reserva tu cita en línea sin complicaciones.</p>
            </a>
            
            <Link href="/login" className="text-center group block cursor-pointer">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:-translate-y-2 group-hover:shadow-md group-hover:bg-emerald-100 transition-all duration-300">
                <span className="material-symbols-outlined text-3xl">medical_information</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight group-hover:text-primary transition-colors">3. Historial Médico</h3>
              <p className="text-gray-500 leading-relaxed">Accede al expediente clínico, recetas y cartilla de vacunación digital siempre que lo necesites.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-gray-900 text-gray-400 py-16 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 relative opacity-90 brightness-200">
              <Image src="/Vetsync_Logo.png" alt="Vetsync Logo" fill className="object-contain" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight block">Vetsync Bilwi</span>
              <span className="text-sm">Cuidando a las mascotas del Caribe Norte</span>
            </div>
          </div>
          <div className="flex gap-8 text-sm font-medium">
            <Link href="#" className="hover:text-white transition-colors">Términos</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/admin-login" className="hover:text-white transition-colors opacity-60">Portal Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
