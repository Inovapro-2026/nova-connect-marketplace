import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatBRL, formatDate } from '@/lib/format';

interface Row {
  id: string; name: string; price: number; image_url: string | null;
  status: string; created_at: string | null;
}

export default function AdminProdutos() {
  const [list, setList] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Produtos — Admin';
    supabase.from('products').select('id, name, price, image_url, status, created_at')
      .order('created_at', { ascending: false }).limit(100).then(({ data }) => {
        setList((data as Row[]) ?? []); setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Produtos</h1>
        <p className="text-muted-foreground">Catálogo geral da plataforma</p>
      </div>
      {loading ? <Skeleton className="h-64 w-full" /> : (
        <Card className="surface-1 border-border/50 overflow-hidden">
          <div className="divide-y divide-border/50">
            {list.map((p) => (
              <div key={p.id} className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-surface-2 overflow-hidden">
                  {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(p.created_at)}</div>
                </div>
                <Badge variant="outline">{p.status}</Badge>
                <div className="font-display font-bold">{formatBRL(p.price)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
