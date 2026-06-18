"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CART_KEY = 'vetsync_cart';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
}

const allProducts: Product[] = [
  { id: '1', name: 'Alimento Premium Royal Canin Adult', category: 'Alimentos', price: 450, originalPrice: 520, image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&auto=format&fit=crop' },
  { id: '2', name: 'Antipulgas Frontline Plus', category: 'Medicamentos', price: 280, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop' },
  { id: '3', name: 'Collar Antiparasitario Seresto', category: 'Accesorios', price: 650, image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&auto=format&fit=crop' },
  { id: '4', name: 'Shampoo Medicado para Perros', category: 'Higiene', price: 185, originalPrice: 220, image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&auto=format&fit=crop' },
  { id: '5', name: 'Alimento Húmedo Gato Whiskas', category: 'Alimentos', price: 95, image: 'https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?w=400&auto=format&fit=crop' },
  { id: '6', name: 'Cama Ortopédica para Mascotas', category: 'Accesorios', price: 890, image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&auto=format&fit=crop' },
  { id: '7', name: 'Vitaminas y Suplementos Caninos', category: 'Medicamentos', price: 320, image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&auto=format&fit=crop' },
  { id: '8', name: 'Juguete Interactivo Kong Classic', category: 'Juguetes', price: 210, originalPrice: 250, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&auto=format&fit=crop' },
];

export default function Carrito() {
  const [cart, setCart] = useState<{ id: string; qty: number }[]>([]);
  const [ordered, setOrdered] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch {}
  }, []);

  const saveCart = (updated: { id: string; qty: number }[]) => {
    setCart(updated);
    try { localStorage.setItem(CART_KEY, JSON.stringify(updated)); } catch {}
  };

  const updateQty = (id: string, delta: number) => {
    const updated = cart
      .map(item => item.id === id ? { ...item, qty: item.qty + delta } : item)
      .filter(item => item.qty > 0);
    saveCart(updated);
  };

  const removeItem = (id: string) => {
    saveCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => saveCart([]);

  const cartItems = cart.map(cartItem => {
    const product = allProducts.find(p => p.id === cartItem.id);
    return product ? { ...product, qty: cartItem.qty } : null;
  }).filter(Boolean) as (Product & { qty: number })[];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 500 ? 0 : 80;
  const total = subtotal + shipping;

  const handleOrder = () => {
    clearCart();
    setOrdered(true);
  };

  if (ordered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
        <div className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-primary">¡Pedido realizado!</h2>
          <p className="text-on-surface-variant mt-2">Tu pedido ha sido confirmado. Te notificaremos cuando esté en camino.</p>
        </div>
        <Link href="/tienda" className="bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all">
          Seguir comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link href="/tienda" className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h2 className="font-headline-lg text-[28px] text-primary font-bold">Mi Carrito</h2>
          <p className="text-on-surface-variant text-sm">{cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}</p>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
          <span className="material-symbols-outlined text-7xl text-outline-variant">shopping_cart</span>
          <div>
            <h3 className="text-xl font-bold text-on-surface">Tu carrito está vacío</h3>
            <p className="text-on-surface-variant mt-1 text-sm">Explora la tienda y agrega productos para tus mascotas.</p>
          </div>
          <Link href="/tienda" className="bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md">
            Ir a la Tienda
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-all">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover border border-outline-variant/30 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{item.category}</p>
                  <h3 className="font-semibold text-on-surface text-sm mt-0.5 line-clamp-2">{item.name}</h3>
                  <p className="text-primary font-bold text-base mt-1">${item.price.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-2 bg-surface-container-low rounded-xl p-1">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors text-on-surface font-bold"
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <span className="w-6 text-center font-bold text-sm text-on-surface">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors text-on-surface font-bold"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                  <p className="text-sm font-bold text-primary">${(item.price * item.qty).toLocaleString()}</p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-error hover:bg-error-container/30 p-1 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-sm text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 mt-2"
            >
              <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
              Vaciar carrito
            </button>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-6 sticky top-20 space-y-4">
              <h3 className="font-bold text-lg text-primary">Resumen del pedido</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal ({cartItems.reduce((s, i) => s + i.qty, 0)} artículos)</span>
                  <span className="font-semibold text-on-surface">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Envío</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-secondary' : 'text-on-surface'}`}>
                    {shipping === 0 ? '¡Gratis!' : `$${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[11px] text-on-surface-variant bg-surface-container-low px-3 py-2 rounded-lg">
                    🚚 Agrega ${(500 - subtotal).toLocaleString()} más para envío gratis
                  </p>
                )}
                <div className="border-t border-outline-variant pt-3 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">${total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleOrder}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">payments</span>
                Confirmar Pedido
              </button>

              <Link
                href="/tienda"
                className="w-full block text-center py-2.5 border border-outline-variant rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-all"
              >
                Seguir comprando
              </Link>

              {/* Métodos de pago */}
              <div className="pt-2 border-t border-outline-variant/50">
                <p className="text-[11px] text-on-surface-variant text-center mb-2">Métodos de pago aceptados</p>
                <div className="flex justify-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[22px]">credit_card</span>
                  <span className="material-symbols-outlined text-[22px]">account_balance</span>
                  <span className="material-symbols-outlined text-[22px]">phone_iphone</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
