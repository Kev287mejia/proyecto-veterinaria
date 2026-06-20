const { createClient } = require('@supabase/supabase-js');
global.WebSocket = class {};

const supabaseUrl = 'https://djrpiqwcrpdtoqzyekug.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTczNjg0MywiZXhwIjoyMDk3MzEyODQzfQ.iDuyAzmqlvikSbcbm1N6j7fH9pijkVTOt6OJHeg2waA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data, error } = await supabase.from('pets').insert({
    name: 'Rey',
    species: 'Caninos',
    breed: 'Mestizo',
    birth_date: '2023-01-01',
    weight: 12.5,
    medical_notes: 'Saludable',
    owner_id: 'ebbb8e32-72a7-4fd1-b7c0-4739f97bae79', // Kaira Mendoza
    avatar_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400'
  }).select();

  console.log('Result:', error ? error.message : data);
}
main();
