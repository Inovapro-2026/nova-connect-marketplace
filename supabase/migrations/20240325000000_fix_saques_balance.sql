
-- Migration to fix balance update after withdrawal
-- Ensures balance is deducted from available balance when a withdrawal is marked as 'pago'

-- 1. Ensure columns exist in saques table
ALTER TABLE public.saques ADD COLUMN IF NOT EXISTS valor_bruto DECIMAL(10,2);
ALTER TABLE public.saques ADD COLUMN IF NOT EXISTS taxa_valor DECIMAL(10,2);
ALTER TABLE public.saques ADD COLUMN IF NOT EXISTS valor_liquido DECIMAL(10,2);
ALTER TABLE public.saques ADD COLUMN IF NOT EXISTS tipo_pix TEXT;

-- 2. Update existing records to have valor_bruto if they only have valor
UPDATE public.saques SET valor_bruto = valor WHERE valor_bruto IS NULL;

-- 3. Redefine solicitar_saque_vendedor to include balance validation
CREATE OR REPLACE FUNCTION public.solicitar_saque_vendedor(
    p_vendedor_id UUID,
    p_valor DECIMAL,
    p_valor_bruto DECIMAL,
    p_taxa_valor DECIMAL,
    p_valor_liquido DECIMAL,
    p_chave_pix TEXT,
    p_tipo_pix TEXT
) RETURNS VOID AS $$
DECLARE
    v_saldo_atual DECIMAL;
BEGIN
    -- Get current balance from perfis_vendedor
    SELECT saldo_disponivel INTO v_saldo_atual
    FROM public.perfis_vendedor
    WHERE id = p_vendedor_id;

    -- Validate balance
    IF v_saldo_atual < p_valor_bruto THEN
        RAISE EXCEPTION 'Saldo insuficiente para realizar o saque. Saldo: %, Solicitado: %', v_saldo_atual, p_valor_bruto;
    END IF;

    -- Insert withdrawal request
    INSERT INTO public.saques (
        vendedor_id,
        valor,
        valor_bruto,
        taxa_valor,
        valor_liquido,
        chave_pix,
        tipo_pix,
        status,
        metodo,
        created_at,
        updated_at
    ) VALUES (
        p_vendedor_id,
        p_valor,
        p_valor_bruto,
        p_taxa_valor,
        p_valor_liquido,
        p_chave_pix,
        p_tipo_pix,
        'pendente',
        'PIX',
        now(),
        now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Redefine aprovar_saque_vendedor to handle balance deduction
CREATE OR REPLACE FUNCTION public.aprovar_saque_vendedor(
    p_saque_id UUID
) RETURNS VOID AS $$
DECLARE
    v_saque RECORD;
    v_saldo_atual DECIMAL;
BEGIN
    -- Get saque info
    SELECT * INTO v_saque
    FROM public.saques
    WHERE id = p_saque_id;

    IF v_saque IS NULL THEN
        RAISE EXCEPTION 'Saque não encontrado.';
    END IF;

    IF v_saque.status = 'pago' THEN
        RAISE EXCEPTION 'Este saque já foi pago.';
    END IF;

    -- Get current balance
    SELECT saldo_disponivel INTO v_saldo_atual
    FROM public.perfis_vendedor
    WHERE id = v_saque.vendedor_id;

    -- Validate balance again at approval time
    IF v_saldo_atual < v_saque.valor_bruto THEN
        RAISE EXCEPTION 'Saldo insuficiente do vendedor para aprovar este saque. Saldo: %, Valor do Saque: %', v_saldo_atual, v_saque.valor_bruto;
    END IF;

    -- 1. Update saque status
    UPDATE public.saques
    SET 
        status = 'pago',
        processado_at = now(),
        updated_at = now()
    WHERE id = p_saque_id;

    -- 2. Deduct from balance
    UPDATE public.perfis_vendedor
    SET 
        saldo_disponivel = saldo_disponivel - v_saque.valor_bruto,
        saldo_sacado = COALESCE(saldo_sacado, 0) + v_saque.valor_bruto,
        updated_at = now()
    WHERE id = v_saque.vendedor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
