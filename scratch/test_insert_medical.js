const { createClient } = require('@supabase/supabase-js');
global.WebSocket = class {};

const supabaseUrl = 'https://djrpiqwcrpdtoqzyekug.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTczNjg0MywiZXhwIjoyMDk3MzEyODQzfQ.iDuyAzmqlvikSbcbm1N6j7fH9pijkVTOt6OJHeg2waA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  // Let's query information_schema.columns via a postgrest trick if possible or just try to insert both ways.
  // We can try to insert a record.
  console.log("Trying to insert with visit_date...");
  const insert1 = await supabase.from('medical_records').insert({
    pet_id: 'd0314512-3570-44e2-95ad-af1e1a738f05',
    vet_id: 'e40c97b1-94aa-4bd5-9c87-30ed33171e96',
    diagnosis: 'Test diagnosis visit_date',
    treatment: 'Test treatment',
    prescription: 'Test prescription',
    visit_date: new Date().toISOString()
  }).select();
  
  console.log("Insert with visit_date result status:", insert1.status);
  console.log("Insert with visit_date result error:", insert1.error);
  console.log("Insert with visit_date result data:", insert1.data);

  console.log("Trying to insert with record_date...");
  const insert2 = await supabase.from('medical_records').insert({
    pet_id: 'd0314512-3570-44e2-95ad-af1e1a738f05',
    vet_id: 'e40c97b1-94aa-4bd5-9c87-30ed33171e96',
    diagnosis: 'Test diagnosis record_date',
    treatment: 'Test treatment',
    prescription: 'Test prescription',
    record_date: new Date().toISOString()
  }).select();

  console.log("Insert with record_date result status:", insert2.status);
  console.log("Insert with record_date result error:", insert2.error);
  console.log("Insert with record_date result data:", insert2.data);
  
  // Cleanup test insertions
  await supabase.from('medical_records').delete().ilike('diagnosis', '%Test diagnosis%');
}

main();
