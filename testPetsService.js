const url = 'https://djrpiqwcrpdtoqzyekug.supabase.co/rest/v1/pets?select=*';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTczNjg0MywiZXhwIjoyMDk3MzEyODQzfQ.iDuyAzmqlvikSbcbm1N6j7fH9pijkVTOt6OJHeg2waA';

async function run() {
  const res = await fetch(url, {
    headers: { 'apikey': apikey, 'Authorization': `Bearer ${apikey}` }
  });
  const data = await res.json();
  console.log("ALL PETS IN DB (RLS BYPASSED):", data);
}
run();
