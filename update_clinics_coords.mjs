import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateClinics() {
  console.log("Fetching clinics...");
  const { data: clinics, error } = await supabase.from('vet_clinics').select('id, latitude, longitude');
  
  if (error) {
    console.error("Error fetching clinics:", error);
    return;
  }

  console.log(`Found ${clinics.length} clinics.`);

  for (const clinic of clinics) {
    if (clinic.latitude == null || clinic.longitude == null) {
      const lat = 14.0306 + (Math.random() * 0.01 - 0.005);
      const lng = -83.3858 + (Math.random() * 0.01 - 0.005);
      
      const { error: updateError } = await supabase
        .from('vet_clinics')
        .update({ latitude: lat, longitude: lng })
        .eq('id', clinic.id);
        
      if (updateError) {
        console.error(`Failed to update clinic ${clinic.id}:`, updateError);
      } else {
        console.log(`Updated clinic ${clinic.id} with Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
      }
    }
  }
  
  console.log("Finished updating clinics.");
}

updateClinics();
