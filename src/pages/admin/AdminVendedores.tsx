import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Store } from 'lucide-react';
import { formatDate } from '@/lib/format';

interface Row {
  id: string; nome_profissional: string | null; avaliacao_media: number | null;
  total_vendas: number | null; verificado: boolean | null; created_at: string | null;
}

export default function AdminVendedores() {
  const [list, setList] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Vendedores — Admin';
    supabase.from('perfis_vendedor')
      .select('id, nome_profissional, avaliacao_media, total_vendas, verificado, created_at')
      .order('created_at', { ascending: false }).limit(100).then(({ data }) => {
        setList((data as Row[]) ?? []); setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Vendedores</h1>
        <p className="text-muted-foreground">Lojas ativas na plataforma</p>
      </div>
      {loading ? <Skeleton className="h-64 w-full" /> : (
        <Card className="surface-1 border-border/50 overflow-hidden">
          <div className="divide-y divide-border/50">
            {list.map((v) => (
              <div key={v.id} className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Store className="h-5 w-5 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{v.nome_profissional ?? 'Sem nome'}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(v.created_at)}</div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  {Number(v.avaliacao_media ?? 0).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">{v.total_vendas ?? 0} vendas</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
