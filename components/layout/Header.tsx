import Link from 'next/link';

export default function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-surface border-b border-outline-variant sticky top-0 z-40">
      <div className="flex-1">
        <div className="relative w-full max-w-md hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            className="w-full bg-surface-container-low text-on-surface font-body-md pl-10 pr-4 py-2 rounded-full border-none focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
            placeholder="Buscar pacientes, clientes, productos..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors active:opacity-80 scale-98">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface"></span>
        </button>
        <Link href="/tienda/carrito" className="relative p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors active:opacity-80 scale-98">
          <span className="material-symbols-outlined">shopping_cart</span>
        </Link>
        <Link href="/perfil" className="flex items-center gap-3 cursor-pointer p-1 pr-3 hover:bg-surface-container-low rounded-full transition-colors active:opacity-80 scale-98">
          <img alt="Perfil" className="w-8 h-8 rounded-full object-cover border border-outline-variant" src="https://i.pravatar.cc/150?u=vetsync" />
          <div className="hidden md:flex flex-col">
            <span className="font-label-md font-bold text-on-surface">Dr. Carlos M.</span>
            <span className="font-label-sm text-on-surface-variant text-[11px]">Veterinario</span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant hidden md:block">arrow_drop_down</span>
        </Link>
      </div>
    </header>
  );
}
