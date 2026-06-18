"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

const CART_KEY = 'vetsync_cart';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number; // Simularemos esto en el frontend para mantener el badge
  rating?: number; // Simulado
  reviews?: number; // Simulado
  image_url: string;
  badge?: 'Nuevo' | 'Oferta' | 'Popular'; // Calculado
  description: string;
  stock_quantity?: number;
}

// Productos cargados dinámicamente

const categories = ['Todos', 'Alimentos', 'Medicamentos', 'Accesorios', 'Higiene', 'Juguetes'];

export default function Tienda() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{id: string; qty: number}[]>([]);
  const [sortBy, setSortBy] = useState('popular');
  const [userProfile, setUserProfile] = useState<any>(null);

  // Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [productForm, setProductForm] = useState({
    id: '', name: '', category: 'Alimentos', price: 0, 
    stock_quantity: 0, image_url: '', description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar carrito desde localStorage al montar y obtener productos
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch {}

    async function loadUserRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile) setUserProfile(profile);
      }
    }
    loadUserRole();

    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) {
        // Simulamos el rating y reviews basándonos en el ID o contenido para que se vea igual de bien que el mockup
        const mappedProducts = data.map((p, index) => {
          let badge: 'Nuevo' | 'Oferta' | 'Popular' | undefined;
          let originalPrice: number | undefined;
          
          if (index % 3 === 0) badge = 'Oferta';
          else if (index % 4 === 0) badge = 'Nuevo';
          else if (index % 2 === 0) badge = 'Popular';

          if (badge === 'Oferta') {
            originalPrice = Math.round(p.price * 1.2); // 20% descuento aprox
          }

          return {
            ...p,
            rating: 4 + (Math.random()), // Entre 4 y 5
            reviews: 20 + Math.floor(Math.random() * 200),
            badge,
            originalPrice
          };
        });
        setProducts(mappedProducts);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const addToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === productId);
      const updated = existing
        ? prev.map(i => i.id === productId ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { id: productId, qty: 1 }];
      // Guardar en localStorage
      try { localStorage.setItem(CART_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setProductForm({ id: '', name: '', category: 'Alimentos', price: 0, stock_quantity: 0, image_url: '', description: '' });
    setShowProductModal(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setIsEditing(true);
    setProductForm({
      id: prod.id,
      name: prod.name,
      category: prod.category,
      price: prod.price,
      stock_quantity: prod.stock_quantity || 0,
      image_url: prod.image_url,
      description: prod.description
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
    } else {
      console.error('Error al eliminar producto', error);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const productData = {
      name: productForm.name,
      category: productForm.category,
      price: Number(productForm.price),
      stock_quantity: Number(productForm.stock_quantity),
      image_url: productForm.image_url,
      description: productForm.description
    };

    if (isEditing) {
      const { data, error } = await supabase.from('products').update(productData).eq('id', productForm.id).select().single();
      if (!error && data) {
        setProducts(products.map(p => p.id === productForm.id ? { ...p, rating: p.rating, reviews: p.reviews } : p));
        setShowProductModal(false);
      }
    } else {
      const { data, error } = await supabase.from('products').insert([productData]).select().single();
      if (!error && data) {
        setProducts([{ ...data, rating: 5, reviews: 0 }, ...products]);
        setShowProductModal(false);
      }
    }
    setIsSubmitting(false);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const filtered = products
    .filter(p => {
      const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (b.reviews || 0) - (a.reviews || 0); // popular
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'Oferta': return 'bg-error text-white';
      case 'Nuevo': return 'bg-secondary text-on-secondary';
      case 'Popular': return 'bg-primary text-on-primary';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-[28px] md:text-[32px] text-primary tracking-tight font-bold">
            Tienda Veterinaria
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Productos de calidad para el bienestar de tu mascota.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {userProfile?.role === 'vet' && (
            <button onClick={handleOpenAdd} className="bg-primary text-on-primary px-4 py-3 rounded-2xl flex items-center gap-2 font-bold hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]">
              <span className="material-symbols-outlined">add</span>
              <span className="hidden sm:inline">Añadir Producto</span>
            </button>
          )}
          {/* Carrito */}
          <Link
            href="/tienda/carrito"
            className="relative flex items-center gap-2 bg-surface-container-lowest border border-outline-variant px-4 py-2.5 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-all"
          >
            <span className="material-symbols-outlined text-[20px] text-primary">shopping_cart</span>
            Mi Carrito
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-on-primary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Categorías */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none cursor-pointer min-w-[180px]"
        >
          <option value="popular">Más populares</option>
          <option value="rating">Mejor valorados</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
        </select>
        <p className="text-sm text-on-surface-variant whitespace-nowrap">
          <span className="font-bold text-primary">{filtered.length}</span> productos
        </p>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(product => {
          const inCart = cart.find(i => i.id === product.id);
          const discount = product.originalPrice
            ? Math.round((1 - product.price / product.originalPrice) * 100)
            : null;

          return (
            <div key={product.id} className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/30 hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
              
              {/* Imagen */}
              <div className="relative h-48 overflow-hidden bg-surface-container-low group">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Controles de Veterinario */}
                {(userProfile?.role === 'vet' || userProfile?.role === 'admin') && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button onClick={() => handleOpenEdit(product)} className="bg-surface/90 text-primary p-2 rounded-xl hover:bg-surface shadow-sm backdrop-blur-sm transition-all" title="Editar">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="bg-surface/90 text-error p-2 rounded-xl hover:bg-surface shadow-sm backdrop-blur-sm transition-all" title="Eliminar">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                )}
                {product.badge && (
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${getBadgeStyle(product.badge)}`}>
                    {product.badge}
                  </span>
                )}
                {discount && (
                  <span className="absolute top-3 right-3 bg-error text-white px-2 py-1 rounded-full text-[11px] font-bold">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">{product.category}</p>
                <h3 className="font-semibold text-on-surface text-sm leading-snug mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">{product.description}</p>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="flex">
                    {[1,2,3,4,5].map(star => (
                      <span key={star} className={`material-symbols-outlined text-[14px] ${star <= Math.round(product.rating || 5) ? 'text-amber-400' : 'text-outline-variant'}`}
                        style={{ fontVariationSettings: star <= Math.round(product.rating || 5) ? "'FILL' 1" : undefined }}>
                        star
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] text-on-surface-variant">({product.reviews})</span>
                </div>

                {/* Precio y botón */}
                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-primary">${product.price.toLocaleString()}</p>
                    {product.originalPrice && (
                      <p className="text-xs text-on-surface-variant line-through">${product.originalPrice.toLocaleString()}</p>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(product.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                      inCart
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-primary text-on-primary hover:bg-primary/90 shadow-sm'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {inCart ? 'check' : 'add_shopping_cart'}
                    </span>
                    {inCart ? `x${inCart.qty}` : 'Añadir'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-outline-variant">search_off</span>
            <p className="text-on-surface-variant mt-4 font-medium">No se encontraron productos para tu búsqueda.</p>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory('Todos'); }}
              className="mt-4 text-primary font-semibold text-sm hover:underline">
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* MODAL DE PRODUCTO (VETERINARIOS/ADMIN) */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest sticky top-0 z-10">
              <h3 className="text-xl font-bold text-primary">{isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h3>
              <button onClick={() => setShowProductModal(false)} className="text-on-surface-variant hover:text-error transition-colors p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="productForm" onSubmit={handleSaveProduct} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1">Nombre <span className="text-error">*</span></label>
                    <input required type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Ej. Alimento Premium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1">Categoría <span className="text-error">*</span></label>
                    <select required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none">
                      {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1">Precio ($) <span className="text-error">*</span></label>
                    <input required type="number" min="0" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1">Stock Disponible</label>
                    <input type="number" min="0" value={productForm.stock_quantity} onChange={e => setProductForm({...productForm, stock_quantity: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">URL de Imagen <span className="text-error">*</span></label>
                  <input required type="url" value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Descripción</label>
                  <textarea rows={3} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" placeholder="Detalles del producto..."></textarea>
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest flex justify-end gap-3">
              <button type="button" onClick={() => setShowProductModal(false)} className="px-6 py-2.5 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors">Cancelar</button>
              <button type="submit" form="productForm" disabled={isSubmitting || !productForm.name} className="px-6 py-2.5 rounded-xl font-semibold bg-primary text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-50">
                {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
