const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://djrpiqwcrpdtoqzyekug.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MzY4NDMsImV4cCI6MjA5NzMxMjg0M30.aaeDNjgCLeypLVfW3-DZq7_a-6p58nU0fO0uQzqMvkk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Try to find the user 'Jasmir' or 'Kevin'
  const { data: users, error: selectError } = await supabase
    .from('profiles')
    .select('*')
    .or('full_name.ilike.%Kevin%,full_name.ilike.%Jasmir%');
    
  if (selectError) {
    console.error("Error fetching user:", selectError);
    return;
  }
  
  if (!users || users.length === 0) {
    console.log("User not found");
    return;
  }
  
  const targetUser = users[0];
  console.log("Found user:", targetUser);
  
  // Try to update their role to admin
  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', targetUser.id)
    .select();
    
  console.log("Update Data:", updateData);
  console.log("Update Error:", updateError);
}

run();
