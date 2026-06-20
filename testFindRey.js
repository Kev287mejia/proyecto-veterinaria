const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTczNjg0MywiZXhwIjoyMDk3MzEyODQzfQ.iDuyAzmqlvikSbcbm1N6j7fH9pijkVTOt6OJHeg2waA';
const headers = { 'apikey': apikey, 'Authorization': `Bearer ${apikey}` };

async function searchTable(tableName) {
  const url = `https://djrpiqwcrpdtoqzyekug.supabase.co/rest/v1/${tableName}?select=*`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.error(`Error querying ${tableName}:`, await res.text());
    return;
  }
  const data = await res.json();
  console.log(`Table ${tableName} has ${data.length} rows.`);
  if (data.length > 0) {
    const stringified = JSON.stringify(data);
    if (stringified.toLowerCase().includes('rey')) {
      console.log(`  ==> FOUND "Rey" in table ${tableName}:`, data);
    }
  }
}

async function run() {
  const tables = [
    'profiles',
    'vet_clinics',
    'pets',
    'appointments',
    'medical_records',
    'vaccines',
    'vaccinations',
    'products',
    'orders',
    'order_items'
  ];
  for (const table of tables) {
    await searchTable(table);
  }
}
run();
