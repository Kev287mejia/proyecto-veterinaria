-- ====================================================================
-- VetSync - Script de Migración para el Sistema de Reseñas y Calificaciones
-- Instrucciones: Ejecuta este script en el editor SQL de tu consola de Supabase.
-- ====================================================================

-- 1. Crear la tabla de reseñas
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES public.vet_clinics(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Garantizar que un dueño califique una cita única una sola vez
    CONSTRAINT unique_appointment_review UNIQUE (appointment_id)
);

-- 2. Habilitar RLS (Seguridad a Nivel de Fila)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. Crear Políticas de Seguridad RLS
-- Nota: Si el script se vuelve a correr, eliminamos las políticas anteriores para evitar conflictos
DROP POLICY IF EXISTS "Permitir lectura pública de reseñas" ON public.reviews;
DROP POLICY IF EXISTS "Permitir a los dueños insertar sus reseñas" ON public.reviews;
DROP POLICY IF EXISTS "Permitir a los dueños modificar sus propias reseñas" ON public.reviews;
DROP POLICY IF EXISTS "Permitir a los dueños eliminar sus propias reseñas" ON public.reviews;

-- Política 3.1: Lectura pública para cualquier usuario (permite ver puntuaciones en el directorio)
CREATE POLICY "Permitir lectura pública de reseñas" ON public.reviews
    FOR SELECT USING (true);

-- Política 3.2: Permitir insertar reseñas solo si el dueño es el usuario autenticado
-- y si la cita existe, está completada ('completed') y le pertenece.
CREATE POLICY "Permitir a los dueños insertar sus reseñas" ON public.reviews
    FOR INSERT WITH CHECK (
        auth.uid() = owner_id 
        AND EXISTS (
            SELECT 1 FROM public.appointments a
            WHERE a.id = appointment_id 
              AND a.owner_id = auth.uid() 
              AND a.status = 'completed'
        )
    );

-- Política 3.3: Permitir a los dueños modificar sus propias reseñas
CREATE POLICY "Permitir a los dueños modificar sus propias reseñas" ON public.reviews
    FOR UPDATE USING (auth.uid() = owner_id);

-- Política 3.4: Permitir a los dueños eliminar sus propias reseñas
CREATE POLICY "Permitir a los dueños eliminar sus propias reseñas" ON public.reviews
    FOR DELETE USING (auth.uid() = owner_id);
