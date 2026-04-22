import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Package, ListOrdered } from 'lucide-react';
import { formatBRL, formatDate } from '@/lib/format';

interface Pedido {
  id: string; numero: string; status: string; valor_total: number;
  created_at: string | null; vendedor_id: string;
}

const statusColor: Record<string, string> = {
  aguardando: 'bg-warning/20 text-warning',
  em_andamento: 'bg-primary/20 text-primary',
  entregue: 'bg-accent/20 text-accent',
  concluido: 'bg-success/20 text-success',
  cancelado: 'bg-destructive/20 text-destructive',
  reembolsado: 'bg-muted text-muted-foreground',
};

const statusLabel: Record<string, string> = {
  aguardando: 'Aguardando',
  em_andamento: 'Em andamento',
  entregue: 'Entregue',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  reembolsado: 'Reembolsado',
};

export default function PedidosCliente() {
  const { user } = useAuth();
  const [list, setList] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Meus Pedidos — InovaPro Shop';
    if (!user) return;
    (async () => {
      const { data: u } = await supabase.from('usuarios').select('id').eq('auth_user_id', user.id).maybeSingle();
      if (!u) { setLoading(false); return; }
      const { data } = await supabase.from('pedidos')
        .select('id, numero, status, valor_total, created_at, vendedor_id')
        .eq('cliente_id', u.id).order('created_at', { ascending: false });
      setList((data as Pedido[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Meus Pedidos</h1>
        <p className="text-muted-foreground">Acompanhe suas compras</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : list.length === 0 ? (
        <Card className="surface-1 border-border/50 p-12 text-center">
          <ListOrdered className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold mb-1">Nenhum pedido ainda</h3>
          <p className="text-sm text-muted-foreground mb-4">Quando você comprar algo, ele aparecerá aqui.</p>
          <Button asChild className="gradient-primary border-0 text-white"><Link to="/">Ver produtos</Link></Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((p) => (
            <Card key={p.id} className="surface-1 border-border/50 p-5 flex items-center gap-4 hover:border-primary/60 transition-colors">
              <div className="h-12 w-12 rounded-lg gradient-primary/20 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">Pedido {p.numero}</div>
                <div className="text-xs text-muted-foreground">{formatDate(p.created_at)}</div>
              </div>
              <Badge className={`${statusColor[p.status] ?? 'bg-muted'} border-0`}>{statusLabel[p.status] ?? p.status}</Badge>
              <div className="font-display font-bold text-gradient">{formatBRL(p.valor_total)}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
