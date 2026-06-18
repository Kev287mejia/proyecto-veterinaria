const url = 'https://djrpiqwcrpdtoqzyekug.supabase.co/rest/v1/profiles?full_name=ilike.*Kevin*';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MzY4NDMsImV4cCI6MjA5NzMxMjg0M30.aaeDNjgCLeypLVfW3-DZq7_a-6p58nU0fO0uQzqMvkk';

async function run() {
  const getRes = await fetch(url, {
    headers: { 'apikey': apikey, 'Authorization': `Bearer ${apikey}` }
  });
  const data = await getRes.json();
  console.log("USERS:", data);

  if (data && data.length > 0) {
    const patchUrl = `https://djrpiqwcrpdtoqzyekug.supabase.co/rest/v1/profiles?id=eq.${data[0].id}`;
    const patchRes = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        'apikey': apikey,
        'Authorization': `Bearer ${apikey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ role: 'admin' })
    });
    const patchData = await patchRes.json();
    console.log("UPDATE:", patchData);
  }
}
run();
