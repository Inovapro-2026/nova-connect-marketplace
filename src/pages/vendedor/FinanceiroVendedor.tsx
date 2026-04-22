import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, ArrowDownToLine, Clock } from 'lucide-react';
import { formatBRL, formatDate } from '@/lib/format';

interface Transacao {
  id: string; valor_bruto: number; valor_liquido: number; status: string;
  tipo: string; created_at: string | null;
}

export default function FinanceiroVendedor() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ disp: 0, pendente: 0, sacado: 0 });
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Financeiro — InovaPro Shop';
    if (!user) return;
    (async () => {
      const { data: u } = await supabase.from('usuarios').select('id').eq('auth_user_id', user.id).maybeSingle();
      if (!u) { setLoading(false); return; }
      const { data: pv } = await supabase.from('perfis_vendedor')
        .select('id, saldo_disponivel, saldo_pendente, saldo_sacado').eq('usuario_id', u.id).maybeSingle();
      if (pv) setStats({ disp: Number(pv.saldo_disponivel ?? 0), pendente: Number(pv.saldo_pendente ?? 0), sacado: Number(pv.saldo_sacado ?? 0) });

      if (pv) {
        const { data: tx } = await supabase.from('transacoes')
          .select('id, valor_bruto, valor_liquido, status, tipo, created_at')
          .eq('vendedor_id', pv.id).order('created_at', { ascending: false }).limit(20);
        setTransacoes((tx as Transacao[]) ?? []);
      }
      setLoading(false);
    })();
  }, [user]);

  const cards = [
    { label: 'Saldo disponível', value: formatBRL(stats.disp), icon: DollarSign, color: 'text-success' },
    { label: 'Saldo pendente', value: formatBRL(stats.pendente), icon: Clock, color: 'text-warning' },
    { label: 'Total sacado', value: formatBRL(stats.sacado), icon: ArrowDownToLine, color: 'text-muted-foreground' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Financeiro</h1>
        <p className="text-muted-foreground">Acompanhe seus ganhos e movimentações</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className="surface-1 border-border/50 p-5">
            <c.icon className={`h-6 w-6 mb-3 ${c.color}`} />
            <div className="text-2xl font-display font-bold">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </Card>
        ))}
      </div>

      <Card className="surface-1 border-border/50 p-6">
        <h3 className="font-display text-lg font-semibold mb-4">Últimas transações</h3>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : transacoes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhuma transação ainda.</p>
        ) : (
          <div className="divide-y divide-border/50">
            {transacoes.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium capitalize">{t.tipo}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(t.created_at)} • {t.status}</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-semibold">{formatBRL(t.valor_liquido)}</div>
                  <div className="text-xs text-muted-foreground">Bruto {formatBRL(t.valor_bruto)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
