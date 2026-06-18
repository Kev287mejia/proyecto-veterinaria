import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos la clave de servicio para crear usuarios sin alterar la sesión del admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTczNjg0MywiZXhwIjoyMDk3MzEyODQzfQ.iDuyAzmqlvikSbcbm1N6j7fH9pijkVTOt6OJHeg2waA';

export async function POST(request: Request) {
  try {
    const { email, password, full_name, phone, role } = await request.json();

    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: 'Campos requeridos faltantes.' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 1. Crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    });

    if (authError) throw authError;

    if (authData.user) {
      // 2. Crear el perfil en la tabla profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            full_name,
            phone: phone || null,
            role
          }
        ]);

      if (profileError) throw profileError;

      return NextResponse.json({ success: true, user: authData.user });
    }

    return NextResponse.json({ error: 'No se pudo crear el usuario.' }, { status: 500 });
  } catch (error: any) {
    console.error('API Error creating user:', error);
    return NextResponse.json({ error: error.message || 'Error del servidor.' }, { status: 500 });
  }
}
