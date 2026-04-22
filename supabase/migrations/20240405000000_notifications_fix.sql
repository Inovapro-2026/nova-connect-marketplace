-- Final Fix for notifications module
DO $$
BEGIN
    -- Rename table if it exists as 'notificacoes' or 'avisos'
    -- (already handled in previous migration, but let's ensure 'notifications' is the one)
    
    -- Rename columns to match requested schema
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'user_id') THEN
        ALTER TABLE public.notifications RENAME COLUMN user_id TO recipient_id;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'titulo') THEN
        ALTER TABLE public.notifications RENAME COLUMN titulo TO title;
    END IF;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'mensagem') THEN
        ALTER TABLE public.notifications RENAME COLUMN mensagem TO message;
    END IF;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'lida') THEN
        ALTER TABLE public.notifications RENAME COLUMN lida TO read;
    END IF;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'anexo_url') THEN
        ALTER TABLE public.notifications RENAME COLUMN anexo_url TO attachment_url;
    END IF;

    -- Add updated_at
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'updated_at') THEN
        ALTER TABLE public.notifications ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;

    -- Ensure correct types and constraints
    ALTER TABLE public.notifications ALTER COLUMN recipient_id SET NOT NULL;
    ALTER TABLE public.notifications ALTER COLUMN title SET NOT NULL;
    ALTER TABLE public.notifications ALTER COLUMN message SET NOT NULL;
    ALTER TABLE public.notifications ALTER COLUMN read SET DEFAULT false;
END $$;

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
CREATE POLICY "Users can read their own notifications" ON public.notifications 
    FOR SELECT TO authenticated 
    USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications 
    FOR UPDATE TO authenticated 
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;
CREATE POLICY "Admins can manage notifications" ON public.notifications 
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE auth_user_id = auth.uid() 
            AND tipo_conta = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE auth_user_id = auth.uid() 
            AND tipo_conta = 'admin'
        )
    );
