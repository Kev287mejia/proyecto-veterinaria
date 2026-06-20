const url = 'https://djrpiqwcrpdtoqzyekug.supabase.co/rest/v1/pets?select=id,name,owner_id,owner:profiles!owner_id(full_name)';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MzY4NDMsImV4cCI6MjA5NzMxMjg0M30.aaeDNjgCLeypLVfW3-DZq7_a-6p58nU0fO0uQzqMvkk';

async function run() {
  const res = await fetch(url, {
    headers: { 'apikey': apikey, 'Authorization': `Bearer ${apikey}` }
  });
  const data = await res.json();
  console.log("QUERY RESULT:", data);
}
run();
