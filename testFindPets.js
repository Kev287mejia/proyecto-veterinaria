const { createClient } = require('@supabase/supabase-js');
global.WebSocket = class {};

const supabaseUrl = 'https://djrpiqwcrpdtoqzyekug.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwic2VydmljZV9yb2xlIiwiaWF0IjoxNzgxNzM2ODQzLCJleHAiOjIwOTczMTI4NDN9.iDuyAzmqlvikSbcbm1N6j7fH9pijkVTOt6OJHeg2waA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data, error } = await supabase.from('pets').select('*');
  console.log('Pets Data:', data);
  console.log('Pets Error:', error ? error.message : 'No error');
}
main();
