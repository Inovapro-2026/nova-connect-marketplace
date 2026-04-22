import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ListOrdered, Package } from 'lucide-react';
import { formatBRL, formatDate } from '@/lib/format';
import { toast } from 'sonner';

interface Pedido {
  id: string; numero: string; status: string; valor_total: number;
  valor_liquido_vendedor: number; created_at: string | null;
}

const statusOptions = ['aguardando', 'em_andamento', 'entregue', 'concluido', 'cancelado'];
const statusColor: Record<string, string> = {
  aguardando: 'bg-warning/20 text-warning',
  em_andamento: 'bg-primary/20 text-primary',
  entregue: 'bg-accent/20 text-accent',
  concluido: 'bg-success/20 text-success',
  cancelado: 'bg-destructive/20 text-destructive',
};

export default function PedidosVendedor() {
  const { user } = useAuth();
  const [list, setList] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: u } = await supabase.from('usuarios').select('id').eq('auth_user_id', user.id).maybeSingle();
    if (!u) { setLoading(false); return; }
    const { data: pv } = await supabase.from('perfis_vendedor').select('id').eq('usuario_id', u.id).maybeSingle();
    if (!pv) { setLoading(false); return; }
    const { data } = await supabase.from('pedidos')
      .select('id, numero, status, valor_total, valor_liquido_vendedor, created_at')
      .eq('vendedor_id', pv.id).order('created_at', { ascending: false });
    setList((data as Pedido[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { document.title = 'Pedidos — InovaPro Shop'; load(); /* eslint-disable-next-line */ }, [user]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('pedidos').update({ status: status as any }).eq('id', id);
    if (error) toast.error('Erro ao atualizar');
    else { toast.success('Status atualizado'); load(); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">Gerencie seus pedidos recebidos</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : list.length === 0 ? (
        <Card className="surface-1 border-border/50 p-12 text-center">
          <ListOrdered className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold mb-1">Nenhum pedido ainda</h3>
          <p className="text-sm text-muted-foreground">Quando alguém comprar de você, aparecerá aqui.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((p) => (
            <Card key={p.id} className="surface-1 border-border/50 p-5 flex flex-wrap items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">Pedido {p.numero}</div>
                <div className="text-xs text-muted-foreground">{formatDate(p.created_at)}</div>
              </div>
              <Badge className={`${statusColor[p.status] ?? 'bg-muted'} border-0`}>{p.status}</Badge>
              <div className="text-right">
                <div className="font-display font-bold text-gradient">{formatBRL(p.valor_total)}</div>
                <div className="text-xs text-muted-foreground">Líquido: {formatBRL(p.valor_liquido_vendedor)}</div>
              </div>
              <select value={p.status} onChange={(e) => updateStatus(p.id, e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
