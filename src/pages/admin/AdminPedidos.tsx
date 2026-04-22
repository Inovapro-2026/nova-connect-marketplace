import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatBRL, formatDate } from '@/lib/format';

interface Row {
  id: string; numero: string; status: string; valor_total: number; created_at: string | null;
}

export default function AdminPedidos() {
  const [list, setList] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Pedidos — Admin';
    supabase.from('pedidos').select('id, numero, status, valor_total, created_at')
      .order('created_at', { ascending: false }).limit(100).then(({ data }) => {
        setList((data as Row[]) ?? []); setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">Pedidos da plataforma</p>
      </div>
      {loading ? <Skeleton className="h-64 w-full" /> : (
        <Card className="surface-1 border-border/50 overflow-hidden">
          <div className="divide-y divide-border/50">
            {list.map((p) => (
              <div key={p.id} className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{p.numero}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(p.created_at)}</div>
                </div>
                <Badge variant="outline">{p.status}</Badge>
                <div className="font-display font-bold">{formatBRL(p.valor_total)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
