-- 1. Fix categories table
DO $$
BEGIN
    -- Rename nome to name if it exists
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'nome') THEN
        ALTER TABLE public.categories RENAME COLUMN nome TO name;
    END IF;

    -- Add missing columns
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'scope') THEN
        ALTER TABLE public.categories ADD COLUMN scope TEXT DEFAULT 'both';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'slug') THEN
        ALTER TABLE public.categories ADD COLUMN slug TEXT;
        -- Generate slugs for existing categories
        UPDATE public.categories SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;
        ALTER TABLE public.categories ALTER COLUMN slug SET NOT NULL;
        ALTER TABLE public.categories ADD CONSTRAINT categories_slug_key UNIQUE (slug);
    END IF;
END $$;

-- 2. Fix notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    attachment_url TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Migrate data from 'notificacoes' if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notificacoes') THEN
        INSERT INTO public.notifications (id, user_id, title, message, attachment_url, read, created_at)
        SELECT 
            n.id, 
            u.auth_user_id, 
            n.titulo, 
            n.mensagem, 
            n.arquivo_url, 
            COALESCE(n.lida, false), 
            COALESCE(n.created_at, now())
        FROM public.notificacoes n
        JOIN public.usuarios u ON n.usuario_id = u.id
        ON CONFLICT (id) DO NOTHING;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'avisos') THEN
        INSERT INTO public.notifications (id, user_id, title, message, attachment_url, read, created_at)
        SELECT 
            id, 
            target_usuario_id, 
            titulo, 
            mensagem, 
            anexo_url, 
            COALESCE(lida, false), 
            COALESCE(created_at, now())
        FROM public.avisos
        WHERE target_usuario_id IS NOT NULL
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- 3. Setup RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Categories policies
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated read categories" ON public.categories;
CREATE POLICY "Allow authenticated read categories" ON public.categories 
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow admins to manage categories" ON public.categories;
CREATE POLICY "Allow admins to manage categories" ON public.categories 
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE auth_user_id = auth.uid() 
            AND tipo_conta = 'admin'
        )
    );

-- Notifications policies
DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
CREATE POLICY "Users can read their own notifications" ON public.notifications 
    FOR SELECT TO authenticated 
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications 
    FOR UPDATE TO authenticated 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;
CREATE POLICY "Admins can manage notifications" ON public.notifications 
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE auth_user_id = auth.uid() 
            AND tipo_conta = 'admin'
        )
    );
