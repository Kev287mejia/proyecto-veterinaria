const url = 'https://djrpiqwcrpdtoqzyekug.supabase.co/rest/v1/profiles?id=eq.48fc1f18-1991-4cec-8b31-e9201e3fc70d';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MzY4NDMsImV4cCI6MjA5NzMxMjg0M30.aaeDNjgCLeypLVfW3-DZq7_a-6p58nU0fO0uQzqMvkk';

async function run() {
  const patchRes = await fetch(url, {
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
run();
