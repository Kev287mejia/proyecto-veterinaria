const { createClient } = require('@supabase/supabase-js');
global.WebSocket = class {};

const supabaseUrl = 'https://djrpiqwcrpdtoqzyekug.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTczNjg0MywiZXhwIjoyMDk3MzEyODQzfQ.iDuyAzmqlvikSbcbm1N6j7fH9pijkVTOt6OJHeg2waA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data, error } = await supabase.from('medical_records').insert({
    pet_id: '12345678-1234-1234-1234-123456789012',
    vet_id: '12345678-1234-1234-1234-123456789012',
    diagnosis: 'test',
    treatment: 'test',
    notes: 'notes',
    record_date: '2026-06-18'
  }).select();

  console.log('Result:', error ? error.message : data);
}
main();
