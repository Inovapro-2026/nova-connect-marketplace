import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Package, Trash2 } from 'lucide-react';
import { formatBRL } from '@/lib/format';
import { toast } from 'sonner';

interface Fav {
  id: string; product_id: string;
  product?: { id: string; name: string; price: number; image_url: string | null; status: string };
}

export default function Favoritos() {
  const { user } = useAuth();
  const [list, setList] = useState<Fav[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('favorites').select('id, product_id').eq('user_id', user.id);
    const arr = (data ?? []) as Fav[];
    if (arr.length) {
      const { data: prods } = await supabase.from('products')
        .select('id, name, price, image_url, status').in('id', arr.map((f) => f.product_id));
      const map = new Map((prods ?? []).map((p: any) => [p.id, p]));
      arr.forEach((f) => { f.product = map.get(f.product_id) as any; });
    }
    setList(arr);
    setLoading(false);
  };

  useEffect(() => { document.title = 'Favoritos — InovaPro Shop'; load(); /* eslint-disable-next-line */ }, [user]);

  const remove = async (f: Fav) => {
    await supabase.from('favorites').delete().eq('id', f.id);
    setList((arr) => arr.filter((x) => x.id !== f.id));
    toast.success('Removido');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Favoritos</h1>
        <p className="text-muted-foreground">Produtos que você salvou</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
        </div>
      ) : list.length === 0 ? (
        <Card className="surface-1 border-border/50 p-12 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold mb-1">Nenhum favorito ainda</h3>
          <p className="text-sm text-muted-foreground mb-4">Toque no coração nos produtos que você gostar.</p>
          <Button asChild className="gradient-primary border-0 text-white"><Link to="/">Explorar produtos</Link></Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((f) => (
            <Card key={f.id} className="surface-1 border-border/50 overflow-hidden">
              <Link to={`/produto/${f.product_id}`} className="block aspect-video bg-surface-2">
                {f.product?.image_url ? (
                  <img src={f.product.image_url} alt={f.product?.name} className="h-full w-full object-cover" />
                ) : <div className="h-full w-full flex items-center justify-center text-muted-foreground"><Package className="h-8 w-8" /></div>}
              </Link>
              <div className="p-4">
                <h3 className="font-semibold line-clamp-2 mb-1">{f.product?.name ?? 'Produto removido'}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-display font-bold text-gradient">{formatBRL(f.product?.price ?? 0)}</span>
                  <Button onClick={() => remove(f)} variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
