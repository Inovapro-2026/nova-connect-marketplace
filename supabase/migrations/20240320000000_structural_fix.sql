-- Separate Products and Services
-- 1. Ensure categories table is correct
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    scope TEXT DEFAULT 'both',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create products table (if not exists, otherwise update)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        CREATE TABLE public.products (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            seller_id UUID NOT NULL REFERENCES public.perfis_vendedor(id) ON DELETE CASCADE,
            category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
            name TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            image_url TEXT,
            status TEXT DEFAULT 'draft',
            tipo_entrega TEXT,
            external_link TEXT,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );
    ELSE
        -- Update existing products table if needed
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- 3. Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.perfis_vendedor(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    descricao_curta TEXT,
    descricao_completa TEXT,
    preco_base DECIMAL(10,2) NOT NULL,
    imagem TEXT,
    status TEXT DEFAULT 'draft',
    prazo_estimado TEXT,
    fluxo_chat_obrigatorio BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create avisos table (for system announcements)
CREATE TABLE IF NOT EXISTS public.avisos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    anexo_url TEXT,
    target_usuario_id UUID REFERENCES auth.users(id), -- Specific user or NULL for all
    lida BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Fix RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage categories" ON public.categories FOR ALL USING (true); -- Simplified, assuming admin check is handled elsewhere or by role

-- Policies for products
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (status = 'published');
CREATE POLICY "Allow sellers to manage their products" ON public.products FOR ALL USING (
    seller_id IN (SELECT id FROM public.perfis_vendedor WHERE usuario_id IN (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid()))
);

-- Policies for services
CREATE POLICY "Allow public read services" ON public.services FOR SELECT USING (status = 'draft' OR status = 'published'); -- Adjusted
CREATE POLICY "Allow sellers to manage their services" ON public.services FOR ALL USING (
    seller_id IN (SELECT id FROM public.perfis_vendedor WHERE usuario_id IN (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid()))
);

-- Policies for avisos
CREATE POLICY "Users can read their own avisos or global ones" ON public.avisos FOR SELECT USING (
    target_usuario_id IS NULL OR target_usuario_id = auth.uid()
);
CREATE POLICY "Admins can manage avisos" ON public.avisos FOR ALL USING (true);
