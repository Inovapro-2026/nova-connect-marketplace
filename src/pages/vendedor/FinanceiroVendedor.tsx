import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, ArrowDownToLine, Clock } from 'lucide-react';
import { formatBRL, formatDate } from '@/lib/format';

interface Transacao {
  id: string; 
  valor: number; 
  status: string;
  tipo: string; 
  created_at: string | null;
  descricao?: string;
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
        const { data: tx } = await (supabase.from('financial_ledger') as any)
          .select('id, valor, status, tipo, created_at, descricao')
          .eq('vendedor_id', pv.id).order('created_at', { ascending: false }).limit(20);
        setTransacoes((tx as any[]) ?? []);
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
                <div className="flex flex-col gap-0.5">
                  <div className="font-semibold text-sm capitalize">
                    {t.tipo === 'credit_sale' ? 'Venda' : 
                     t.tipo === 'withdraw_request' ? 'Saque' : 
                     t.tipo === 'withdraw_paid' ? 'Saque Pago' : 
                     t.tipo === 'withdraw_fee' ? 'Taxa de Saque' : t.tipo}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                    {formatDate(t.created_at)} • {
                      t.status === 'completed' ? 'Concluído' : 
                      t.status === 'pending' ? 'Pendente' : 'Cancelado'
                    }
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-display font-bold ${t.valor < 0 ? 'text-destructive' : 'text-success'}`}>
                    {t.valor < 0 ? '-' : '+'}{formatBRL(Math.abs(t.valor))}
                  </div>
                  {t.descricao && <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">{t.descricao}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
