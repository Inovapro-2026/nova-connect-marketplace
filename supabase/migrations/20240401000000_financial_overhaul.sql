
-- REESTRUTURAÇÃO COMPLETA DO MÓDULO FINANCEIRO
-- Foco: Consistência real, histórico Ledger e saldo calculado

-- 1. Criar a tabela de Ledger (Livro Razão)
CREATE TABLE IF NOT EXISTS public.financial_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendedor_id UUID NOT NULL REFERENCES public.perfis_vendedor(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- credit_sale, withdraw_request, withdraw_paid, withdraw_fee, refund, adjustment
    valor DECIMAL(12,2) NOT NULL, -- Positivo para créditos, Negativo para débitos
    referencia_id UUID, -- id do pedido ou id do saque
    referencia_tipo TEXT, -- 'pedido', 'saque'
    status TEXT NOT NULL, -- pending, completed, cancelled
    descricao TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar restrições
DO \$\$
BEGIN
    ALTER TABLE public.financial_ledger DROP CONSTRAINT IF EXISTS financial_ledger_tipo_check;
    ALTER TABLE public.financial_ledger ADD CONSTRAINT financial_ledger_tipo_check 
        CHECK (tipo IN ('credit_sale', 'withdraw_request', 'withdraw_paid', 'withdraw_fee', 'refund', 'adjustment'));

    ALTER TABLE public.financial_ledger DROP CONSTRAINT IF EXISTS financial_ledger_status_check;
    ALTER TABLE public.financial_ledger ADD CONSTRAINT financial_ledger_status_check 
        CHECK (status IN ('pending', 'completed', 'cancelled'));
END \$\$;

-- 2. Habilitar RLS
ALTER TABLE public.financial_ledger ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para o Ledger
DROP POLICY IF EXISTS "Vendedores podem ver suas próprias transações" ON public.financial_ledger;
CREATE POLICY "Vendedores podem ver suas próprias transações" ON public.financial_ledger
    FOR SELECT TO authenticated
    USING (
        vendedor_id IN (
            SELECT id FROM public.perfis_vendedor 
            WHERE usuario_id IN (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Admins podem ver tudo no ledger" ON public.financial_ledger;
CREATE POLICY "Admins podem ver tudo no ledger" ON public.financial_ledger
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE auth_user_id = auth.uid() AND tipo_conta = 'admin'
        )
    );

-- 3. Garantir que as colunas de saldo existem em perfis_vendedor
ALTER TABLE public.perfis_vendedor ADD COLUMN IF NOT EXISTS saldo_disponivel DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.perfis_vendedor ADD COLUMN IF NOT EXISTS saldo_pendente DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.perfis_vendedor ADD COLUMN IF NOT EXISTS saldo_sacado DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.perfis_vendedor ADD COLUMN IF NOT EXISTS total_sacado DECIMAL(12,2) DEFAULT 0;

-- 4. Função para recalcular saldo do vendedor
CREATE OR REPLACE FUNCTION public.recalculate_seller_balance(p_vendedor_id UUID) RETURNS VOID AS \$\$
DECLARE
    v_saldo_disponivel DECIMAL(12,2);
    v_saldo_pendente DECIMAL(12,2);
    v_total_sacado DECIMAL(12,2);
BEGIN
    -- Saldo Disponível: 
    -- Vendas completadas + Qualquer ajuste completado + Débitos (solicitados ou pagos)
    -- O saque (withdraw_request) entra como negativo já na solicitação (pendente ou completo)
    SELECT 
        COALESCE(SUM(CASE 
            WHEN (tipo = 'credit_sale' AND status = 'completed') THEN valor 
            WHEN (tipo = 'withdraw_request' AND status IN ('pending', 'completed')) THEN valor 
            WHEN (tipo NOT IN ('credit_sale', 'withdraw_request') AND status = 'completed') THEN valor
            ELSE 0 
        END), 0)
    INTO v_saldo_disponivel
    FROM public.financial_ledger
    WHERE vendedor_id = p_vendedor_id;

    -- Saldo Pendente: Vendas ainda não liberadas
    SELECT COALESCE(SUM(CASE WHEN tipo = 'credit_sale' AND status = 'pending' THEN valor ELSE 0 END), 0)
    INTO v_saldo_pendente
    FROM public.financial_ledger
    WHERE vendedor_id = p_vendedor_id;

    -- Total Sacado: Somatório de saques efetivamente pagos
    SELECT COALESCE(ABS(SUM(CASE WHEN tipo = 'withdraw_request' AND status = 'completed' THEN valor ELSE 0 END)), 0)
    INTO v_total_sacado
    FROM public.financial_ledger
    WHERE vendedor_id = p_vendedor_id;

    -- Atualizar perfil
    UPDATE public.perfis_vendedor
    SET 
        saldo_disponivel = v_saldo_disponivel,
        saldo_pendente = v_saldo_pendente,
        saldo_sacado = v_total_sacado,
        total_sacado = v_total_sacado,
        updated_at = now()
    WHERE id = p_vendedor_id;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger para atualização automática
CREATE OR REPLACE FUNCTION public.on_financial_ledger_change() RETURNS TRIGGER AS \$\$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM public.recalculate_seller_balance(OLD.vendedor_id);
        RETURN OLD;
    ELSE
        PERFORM public.recalculate_seller_balance(NEW.vendedor_id);
        RETURN NEW;
    END IF;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_financial_ledger_change ON public.financial_ledger;
CREATE TRIGGER trigger_financial_ledger_change
AFTER INSERT OR UPDATE OR DELETE ON public.financial_ledger
FOR EACH ROW EXECUTE FUNCTION public.on_financial_ledger_change();

-- 6. Sincronizar dados históricos para popular o Ledger
-- Limpar ledger antes de repopular para evitar duplicidade durante migração
TRUNCATE public.financial_ledger CASCADE;

-- A. Importar Pedidos (Vendas)
INSERT INTO public.financial_ledger (vendedor_id, tipo, valor, referencia_id, referencia_tipo, status, descricao, created_at)
SELECT 
    vendedor_id, 
    'credit_sale', 
    COALESCE(valor_liquido_vendedor, valor_total * 0.9),
    id, 
    'pedido', 
    CASE 
        WHEN status IN ('pago', 'concluido', 'entregue', 'finalizado') THEN 'completed'
        WHEN status IN ('cancelado', 'devolvido', 'reembolsado', 'estornado') THEN 'cancelled'
        ELSE 'pending'
    END,
    'Venda pedido #' || numero,
    created_at
FROM public.pedidos;

-- B. Importar Saques
INSERT INTO public.financial_ledger (vendedor_id, tipo, valor, referencia_id, referencia_tipo, status, descricao, created_at)
SELECT 
    vendedor_id, 
    'withdraw_request', 
    -COALESCE(valor_bruto, valor), 
    id, 
    'saque', 
    CASE 
        WHEN status IN ('pago', 'concluído', 'sucesso') THEN 'completed'
        WHEN status IN ('cancelado', 'recusado', 'falho') THEN 'cancelled'
        ELSE 'pending'
    END,
    'Saque solicitado via PIX',
    created_at
FROM public.saques;

-- C. Recalcular saldos de todos os vendedores agora
DO \$\$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM public.perfis_vendedor LOOP
        PERFORM public.recalculate_seller_balance(r.id);
    END LOOP;
END \$\$;

-- 7. Redefinir funções de Saque para usar o Ledger

-- Solicitar Saque
CREATE OR REPLACE FUNCTION public.solicitar_saque_vendedor(
    p_vendedor_id UUID,
    p_valor DECIMAL,
    p_valor_bruto DECIMAL,
    p_taxa_valor DECIMAL,
    p_valor_liquido DECIMAL,
    p_chave_pix TEXT,
    p_tipo_pix TEXT
) RETURNS VOID AS \$\$
DECLARE
    v_saldo_disponivel DECIMAL;
    v_saque_id UUID;
BEGIN
    -- Validar saldo (usando o saldo do perfil que é mantido pelo ledger)
    SELECT saldo_disponivel INTO v_saldo_disponivel
    FROM public.perfis_vendedor
    WHERE id = p_vendedor_id;

    IF v_saldo_disponivel < p_valor_bruto THEN
        RAISE EXCEPTION 'Saldo insuficiente. Disponível: %, Solicitado: %', v_saldo_disponivel, p_valor_bruto;
    END IF;

    -- Registrar o pedido de saque
    INSERT INTO public.saques (
        vendedor_id, valor, valor_bruto, taxa_valor, valor_liquido, 
        chave_pix, tipo_pix, status, metodo, created_at, updated_at
    ) VALUES (
        p_vendedor_id, p_valor, p_valor_bruto, p_taxa_valor, p_valor_liquido, 
        p_chave_pix, p_tipo_pix, 'pendente', 'PIX', now(), now()
    ) RETURNING id INTO v_saque_id;

    -- Criar entrada no Ledger (o trigger atualizará o saldo_disponivel do perfil)
    INSERT INTO public.financial_ledger (
        vendedor_id, tipo, valor, referencia_id, referencia_tipo, status, descricao
    ) VALUES (
        p_vendedor_id, 'withdraw_request', -p_valor_bruto, v_saque_id, 'saque', 'pending', 'Solicitação de saque PIX'
    );
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aprovar Saque
CREATE OR REPLACE FUNCTION public.aprovar_saque_vendedor(p_saque_id UUID) RETURNS VOID AS \$\$
BEGIN
    -- Atualizar o registro do saque
    UPDATE public.saques 
    SET status = 'pago', processado_at = now(), updated_at = now() 
    WHERE id = p_saque_id AND status = 'pendente';

    -- Atualizar o Ledger (o trigger atualizará saldo_sacado e manterá saldo_disponivel reduzido)
    UPDATE public.financial_ledger 
    SET status = 'completed', updated_at = now() 
    WHERE referencia_id = p_saque_id AND referencia_tipo = 'saque';
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cancelar Saque
CREATE OR REPLACE FUNCTION public.cancelar_saque_vendedor(p_saque_id UUID) RETURNS VOID AS \$\$
BEGIN
    -- Atualizar o registro do saque
    UPDATE public.saques 
    SET status = 'cancelado', updated_at = now() 
    WHERE id = p_saque_id AND status = 'pendente';

    -- Atualizar o Ledger (o trigger devolverá o valor ao saldo_disponivel)
    UPDATE public.financial_ledger 
    SET status = 'cancelled', updated_at = now() 
    WHERE referencia_id = p_saque_id AND referencia_tipo = 'saque';
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger para novos Pedidos entrarem no Ledger automaticamente
CREATE OR REPLACE FUNCTION public.on_pedido_status_change_ledger() RETURNS TRIGGER AS \$\$
BEGIN
    -- Se o pedido acabou de ser criado, ou mudou de status
    -- Verificar se já existe no ledger
    IF EXISTS (SELECT 1 FROM public.financial_ledger WHERE referencia_id = NEW.id AND referencia_tipo = 'pedido') THEN
        -- Atualizar status no ledger
        UPDATE public.financial_ledger
        SET 
            status = CASE 
                WHEN NEW.status IN ('pago', 'concluido', 'entregue', 'finalizado') THEN 'completed'
                WHEN NEW.status IN ('cancelado', 'devolvido', 'reembolsado', 'estornado') THEN 'cancelled'
                ELSE 'pending'
            END,
            valor = COALESCE(NEW.valor_liquido_vendedor, NEW.valor_total * 0.9),
            updated_at = now()
        WHERE referencia_id = NEW.id AND referencia_tipo = 'pedido';
    ELSE
        -- Inserir novo registro no ledger
        INSERT INTO public.financial_ledger (
            vendedor_id, tipo, valor, referencia_id, referencia_tipo, status, descricao, created_at
        ) VALUES (
            NEW.vendedor_id,
            'credit_sale',
            COALESCE(NEW.valor_liquido_vendedor, NEW.valor_total * 0.9),
            NEW.id,
            'pedido',
            CASE 
                WHEN NEW.status IN ('pago', 'concluido', 'entregue', 'finalizado') THEN 'completed'
                WHEN NEW.status IN ('cancelado', 'devolvido', 'reembolsado', 'estornado') THEN 'cancelled'
                ELSE 'pending'
            END,
            'Venda pedido #' || NEW.numero,
            NEW.created_at
        );
    END IF;
    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_pedido_ledger ON public.pedidos;
CREATE TRIGGER trigger_pedido_ledger
AFTER INSERT OR UPDATE OF status, valor_liquido_vendedor ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.on_pedido_status_change_ledger();
