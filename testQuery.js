const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://djrpiqwcrpdtoqzyekug.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MzY4NDMsImV4cCI6MjA5NzMxMjg0M30.aaeDNjgCLeypLVfW3-DZq7_a-6p58nU0fO0uQzqMvkk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone_number, role, pets(id, name, breed)')
    .eq('role', 'owner')
    .order('full_name', { ascending: true });

  console.log("DATA:", data);
  console.log("ERROR:", error);
}

run();
