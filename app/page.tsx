import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 3600; // Refrescar la caché cada hora (ISR)

export default async function LandingPage() {
  // Usamos un cliente anónimo para evitar leer cookies() y permitir Static Site Generation (SSG)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

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
            <Link 
              href="/registro" 
              className="inline-flex items-center justify-center bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-base hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              Soy Dueño de Mascota
            </Link>
          </div>
        </div>
        
        {/* FADE OUT TO NEXT SECTION */}
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#FAFAFA] to-transparent z-10 pointer-events-none"></div>
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
            
            <Link href="/login" className="text-center group block cursor-pointer">
              <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:-translate-y-2 group-hover:shadow-md group-hover:bg-purple-100 transition-all duration-300">
                <span className="material-symbols-outlined text-3xl">calendar_month</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight group-hover:text-primary transition-colors">2. Agenda citas</h3>
              <p className="text-gray-500 leading-relaxed">Inicia sesión y reserva tu cita en línea sin complicaciones con el veterinario de tu elección.</p>
            </Link>
            
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
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 relative opacity-90 brightness-200">
              <Image src="/Vetsync_Logo.png" alt="Vetsync Logo" fill className="object-contain" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight block mb-1">Vetsync Bilwi</span>
              <span className="text-sm">Cuidando a las mascotas del Caribe Norte</span>
            </div>
          </div>
          <div className="flex gap-8 text-sm font-medium">
            <Link href="#" className="hover:text-white transition-colors">Términos</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
