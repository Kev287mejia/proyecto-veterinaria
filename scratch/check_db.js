const { createClient } = require('@supabase/supabase-js');
global.WebSocket = class {};

const supabaseUrl = 'https://djrpiqwcrpdtoqzyekug.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTczNjg0MywiZXhwIjoyMDk3MzEyODQzfQ.iDuyAzmqlvikSbcbm1N6j7fH9pijkVTOt6OJHeg2waA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log("--- Fetching one medical_record schema/data ---");
  const { data: record, error: recordErr } = await supabase
    .from('medical_records')
    .select('*')
    .limit(1);
  if (recordErr) {
    console.error("Error medical_records:", recordErr);
  } else {
    console.log("medical_records sample row:", record);
  }

  console.log("--- Fetching one appointment schema/data ---");
  const { data: appt, error: apptErr } = await supabase
    .from('appointments')
    .select('*')
    .limit(1);
  if (apptErr) {
    console.error("Error appointments:", apptErr);
  } else {
    console.log("appointments sample row:", appt);
  }

  console.log("--- Fetching one profile schema/data ---");
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
  if (profErr) {
    console.error("Error profiles:", profErr);
  } else {
    console.log("profiles sample row:", profiles);
  }

  console.log("--- Fetching one clinic schema/data ---");
  const { data: clinics, error: clinicErr } = await supabase
    .from('vet_clinics')
    .select('*')
    .limit(1);
  if (clinicErr) {
    console.error("Error clinics:", clinicErr);
  } else {
    console.log("clinics sample row:", clinics);
  }
}

main();
