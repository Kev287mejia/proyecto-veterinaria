global.WebSocket = class {};
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://djrpiqwcrpdtoqzyekug.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTczNjg0MywiZXhwIjoyMDk3MzEyODQzfQ.iDuyAzmqlvikSbcbm1N6j7fH9pijkVTOt6OJHeg2waA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const dummyUuid = '99999999-9999-9999-9999-999999999999';
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      appointment_date: '2026-06-18T10:00:00Z',
      reason: 'Chequeo',
      pet_id: dummyUuid
    });

  console.log('Result for invalid pet_id:');
  console.log('Data:', data);
  console.log('Error:', error);
}

main();
