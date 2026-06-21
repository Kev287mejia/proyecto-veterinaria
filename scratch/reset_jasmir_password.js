const { createClient } = require('@supabase/supabase-js');
global.WebSocket = class {};

const supabaseUrl = 'https://djrpiqwcrpdtoqzyekug.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTczNjg0MywiZXhwIjoyMDk3MzEyODQzfQ.iDuyAzmqlvikSbcbm1N6j7fH9pijkVTOt6OJHeg2waA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const userId = '48fc1f18-1991-4cec-8b31-e9201e3fc70d'; // Jasmir Dixon (Vet)
  
  // 1. Get user details
  const { data: { user }, error: getError } = await supabase.auth.admin.getUserById(userId);
  if (getError) {
    console.error("Error fetching user details from Auth:", getError);
    return;
  }
  
  console.log("User Email:", user.email);
  
  // 2. Set new password
  const newPassword = 'password123';
  const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  );
  
  if (updateError) {
    console.error("Error updating password:", updateError);
  } else {
    console.log(`Successfully updated password for ${user.email} to: ${newPassword}`);
  }
}

main();
