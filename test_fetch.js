const { createClient } = require('@supabase/supabase-js');
global.WebSocket = class {};

const supabaseUrl = 'https://djrpiqwcrpdtoqzyekug.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTczNjg0MywiZXhwIjoyMDk3MzEyODQzfQ.iDuyAzmqlvikSbcbm1N6j7fH9pijkVTOt6OJHeg2waA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data: r1, error: e1 } = await supabase
          .from('medical_records')
          .select('*, clinic:vet_clinics(clinic_name)')
          .limit(1);
  console.log('Med Records Error:', e1 ? e1.message : 'No error');

  const { data: r2, error: e2 } = await supabase
          .from('vaccinations')
          .select('*, clinic:vet_clinics(clinic_name)')
          .limit(1);
  console.log('Vaccinations Error:', e2 ? e2.message : 'No error');
}
main();
