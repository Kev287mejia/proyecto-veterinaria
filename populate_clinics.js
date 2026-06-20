const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const matchUrl = line.match(/^NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.+)$/);
    if (matchUrl) supabaseUrl = matchUrl[1].trim();
    const matchKey = line.match(/^NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.+)$/);
    if (matchKey) supabaseKey = matchKey[1].trim();
  }
} catch (e) {
  console.error("Could not read .env.local:", e);
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase configuration in .env.local");
  process.exit(1);
}

const clinicsToUpsert = [
  {
    id: 'e40c97b1-94aa-4bd5-9c87-30ed33171e96', // Update the existing clinic
    owner_id: '48fc1f18-1991-4cec-8b31-e9201e3fc70d', // Jasmir Dixon (Vet)
    clinic_name: 'Clínica Veterinaria Bilwi',
    description: 'Clínica de referencia local. Ofrecemos atención médica general, vacunas, desparasitación y venta de accesorios para tu mascota.',
    address: 'Frente al Parque Central, Barrio Central',
    city: 'Puerto Cabezas',
    license_number: 'L-VET-001',
    latitude: 14.0315,
    longitude: -83.3850
  },
  {
    clinic_name: 'Veterinaria y Agroservicios San Francisco',
    owner_id: '48fc1f18-1991-4cec-8b31-e9201e3fc70d', // Associate with Jasmir Dixon
    description: 'Especialistas en salud animal. Consulta veterinaria, venta de alimentos concentrados, vitaminas e insumos.',
    address: 'Frente a la terminal de buses vieja, del mercado municipal 1 cuadra al norte',
    city: 'Puerto Cabezas',
    license_number: 'L-VET-002',
    latitude: 14.0298,
    longitude: -83.3865
  },
  {
    clinic_name: 'Agroservicio y Veterinaria El Upareño',
    owner_id: '48fc1f18-1991-4cec-8b31-e9201e3fc70d', // Associate with Jasmir Dixon
    description: 'Tu aliado agropecuario en Bilwi. Medicamentos para mascotas y ganado, concentrados, vacunas y accesorios.',
    address: 'Calle Central, contiguo a la Gasolinera DNP',
    city: 'Puerto Cabezas',
    license_number: 'L-VET-003',
    latitude: 14.0285,
    longitude: -83.3888
  },
  {
    clinic_name: 'Servicios Veterinarios del Caribe',
    owner_id: '48fc1f18-1991-4cec-8b31-e9201e3fc70d', // Associate with Jasmir Dixon
    description: 'Atención veterinaria integral. Consultas a domicilio, vacunación, desparasitación y cirugías menores.',
    address: 'Barrio Punta Fría, del Recinto URACCAN 2 cuadras al este',
    city: 'Puerto Cabezas',
    license_number: 'L-VET-004',
    latitude: 14.0385,
    longitude: -83.3725
  },
  {
    clinic_name: 'Agro-Veterinaria La Finca',
    owner_id: '48fc1f18-1991-4cec-8b31-e9201e3fc70d', // Associate with Jasmir Dixon
    description: 'Venta de vacunas, desparasitantes y alimentos balanceados. Asesoría técnica en salud para animales domésticos y productivos.',
    address: 'Barrio El Muelle, de las oficinas de INPESCA 1 cuadra al oeste',
    city: 'Puerto Cabezas',
    license_number: 'L-VET-005',
    latitude: 14.0225,
    longitude: -83.3820
  },
  {
    clinic_name: 'Clínica Veterinaria Municipal',
    owner_id: '48fc1f18-1991-4cec-8b31-e9201e3fc70d', // Associate with Jasmir Dixon
    description: 'Iniciativa municipal para el bienestar animal. Campañas de vacunación antirrábica y esterilización gratuitas o de bajo costo.',
    address: 'Barrio Peter Ferrera, costado sur de la Alcaldía Municipal de Puerto Cabezas',
    city: 'Puerto Cabezas',
    license_number: 'L-VET-MUNICIPAL',
    latitude: 14.0267,
    longitude: -83.3892
  }
];

async function run() {
  const getUrl = `${supabaseUrl}/rest/v1/vet_clinics?select=*`;
  const getRes = await fetch(getUrl, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  
  if (!getRes.ok) {
    const errText = await getRes.text();
    throw new Error(`Failed to fetch current clinics: ${errText}`);
  }
  
  const existingClinics = await getRes.json();
  console.log("Current clinics in DB:", existingClinics.length);

  for (const clinic of clinicsToUpsert) {
    // Check if the clinic exists (by ID or license number)
    const existing = existingClinics.find(c => (clinic.id && c.id === clinic.id) || (c.license_number && c.license_number === clinic.license_number));
    
    if (existing) {
      console.log(`Updating existing clinic: ${clinic.clinic_name} (ID: ${existing.id})`);
      const updateUrl = `${supabaseUrl}/rest/v1/vet_clinics?id=eq.${existing.id}`;
      const res = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          owner_id: clinic.owner_id,
          clinic_name: clinic.clinic_name,
          description: clinic.description,
          address: clinic.address,
          city: clinic.city,
          license_number: clinic.license_number,
          latitude: clinic.latitude,
          longitude: clinic.longitude
        })
      });
      if (res.ok) {
        console.log(`Successfully updated ${clinic.clinic_name}`);
      } else {
        const errText = await res.text();
        console.error(`Error updating ${clinic.clinic_name}:`, errText);
      }
    } else {
      console.log(`Inserting new clinic: ${clinic.clinic_name}`);
      const insertUrl = `${supabaseUrl}/rest/v1/vet_clinics`;
      const res = await fetch(insertUrl, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(clinic)
      });
      if (res.ok) {
        console.log(`Successfully inserted ${clinic.clinic_name}`);
      } else {
        const errText = await res.text();
        console.error(`Error inserting ${clinic.clinic_name}:`, errText);
      }
    }
  }
  
  // Print final list of clinics
  const finalRes = await fetch(getUrl, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  const finalClinics = await finalRes.json();
  console.log("\nFinal list of clinics in DB:", finalClinics);
}

run().catch(console.error);
