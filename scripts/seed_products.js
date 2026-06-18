const { createClient } = require('@supabase/supabase-js');
global.WebSocket = class {};

const supabaseUrl = 'https://djrpiqwcrpdtoqzyekug.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTczNjg0MywiZXhwIjoyMDk3MzEyODQzfQ.iDuyAzmqlvikSbcbm1N6j7fH9pijkVTOt6OJHeg2waA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const products = [
  {
    name: 'Alimento Premium Royal Canin Adult',
    category: 'Alimentos',
    price: 450,
    image_url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&auto=format&fit=crop',
    description: 'Nutrición completa y balanceada para perros adultos.',
    stock_quantity: 50
  },
  {
    name: 'Antipulgas Frontline Plus',
    category: 'Medicamentos',
    price: 280,
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop',
    description: 'Protección contra pulgas y garrapatas por 1 mes.',
    stock_quantity: 100
  },
  {
    name: 'Collar Antiparasitario Seresto',
    category: 'Accesorios',
    price: 650,
    image_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&auto=format&fit=crop',
    description: 'Protección continua por hasta 8 meses contra pulgas.',
    stock_quantity: 20
  },
  {
    name: 'Shampoo Medicado para Perros',
    category: 'Higiene',
    price: 185,
    image_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&auto=format&fit=crop',
    description: 'Fórmula dermatológica para piel sensible.',
    stock_quantity: 40
  },
  {
    name: 'Alimento Húmedo Gato Whiskas',
    category: 'Alimentos',
    price: 95,
    image_url: 'https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?w=400&auto=format&fit=crop',
    description: 'Sachets de sabores variados para gatos adultos.',
    stock_quantity: 200
  },
  {
    name: 'Cama Ortopédica para Mascotas',
    category: 'Accesorios',
    price: 890,
    image_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&auto=format&fit=crop',
    description: 'Espuma de memoria para descanso óptimo.',
    stock_quantity: 15
  },
  {
    name: 'Vitaminas y Suplementos Caninos',
    category: 'Medicamentos',
    price: 320,
    image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&auto=format&fit=crop',
    description: 'Complejo vitamínico para articulaciones y pelaje.',
    stock_quantity: 35
  },
  {
    name: 'Juguete Interactivo Kong Classic',
    category: 'Juguetes',
    price: 210,
    image_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&auto=format&fit=crop',
    description: 'Juguete rellenable para estimulación mental.',
    stock_quantity: 80
  }
];

async function main() {
  // Check if we already have products
  const { data: existing } = await supabase.from('products').select('id').limit(1);
  if (existing && existing.length > 0) {
    console.log('Products already seeded.');
    return;
  }
  
  const { data, error } = await supabase.from('products').insert(products);
  if (error) {
    console.error('Error seeding products:', error);
  } else {
    console.log('Successfully seeded 8 products.');
  }
}

main();
