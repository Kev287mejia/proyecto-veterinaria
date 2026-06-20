const url = 'https://djrpiqwcrpdtoqzyekug.supabase.co/rest/v1/pets';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MzY4NDMsImV4cCI6MjA5NzMxMjg0M30.aaeDNjgCLeypLVfW3-DZq7_a-6p58nU0fO0uQzqMvkk';

async function run() {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': apikey,
      'Authorization': `Bearer ${apikey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      name: 'AnonPet',
      species: 'Caninos',
      breed: 'Mestizo',
      owner_id: 'ebbb8e32-72a7-4fd1-b7c0-4739f97bae79'
    })
  });
  const data = await res.json();
  console.log("INSERT RESULT:", data);
}
run();
