import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Minus, Plus, ShoppingBag, Trash2, Loader2 } from 'lucide-react';
import { formatBRL } from '@/lib/format';
import { toast } from 'sonner';

interface Item {
  id: string; quantity: number; product_id: string;
  product?: { id: string; name: string; price: number; image_url: string | null; seller_id: string };
}

export default function Carrinho() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('cart_items')
      .select('id, quantity, product_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const list = (data ?? []) as Item[];
    if (list.length) {
      const ids = list.map((i) => i.product_id);
      const { data: prods } = await supabase.from('products')
        .select('id, name, price, image_url, seller_id').in('id', ids);
      const map = new Map((prods ?? []).map((p: any) => [p.id, p]));
      list.forEach((i) => { i.product = map.get(i.product_id) as any; });
    }
    setItems(list);
    setLoading(false);
  };

  useEffect(() => { document.title = 'Carrinho — InovaPro Shop'; load(); /* eslint-disable-next-line */ }, [user]);

  const total = items.reduce((s, i) => s + Number(i.product?.price ?? 0) * i.quantity, 0);

  const updateQty = async (item: Item, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    await supabase.from('cart_items').update({ quantity: newQty }).eq('id', item.id);
    setItems((arr) => arr.map((i) => i.id === item.id ? { ...i, quantity: newQty } : i));
  };

  const remove = async (item: Item) => {
    await supabase.from('cart_items').delete().eq('id', item.id);
    setItems((arr) => arr.filter((i) => i.id !== item.id));
    toast.success('Item removido');
  };

  const checkout = async () => {
    if (!items.length || !user) return;
    setChecking(true);
    const { data, error } = await supabase.functions.invoke('mp-checkout', {
      body: {
        items: items.map((i) => ({
          id: i.product_id,
          name: i.product!.name,
          price: Number(i.product!.price),
          quantity: i.quantity,
          seller_id: i.product!.seller_id,
        })),
      },
    });
    setChecking(false);
    if (error || !data?.init_point) {
      toast.error('Não foi possível iniciar o checkout');
      return;
    }
    window.location.href = data.init_point;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Carrinho</h1>
        <p className="text-muted-foreground">Revise os itens antes de finalizar</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : items.length === 0 ? (
        <Card className="surface-1 border-border/50 p-12 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold mb-1">Carrinho vazio</h3>
          <p className="text-sm text-muted-foreground mb-4">Explore a vitrine e encontre produtos incríveis.</p>
          <Button asChild className="gradient-primary border-0 text-white"><Link to="/">Ver produtos</Link></Button>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
          <div className="space-y-3">
            {items.map((i) => (
              <Card key={i.id} className="surface-1 border-border/50 p-4 flex items-center gap-4">
                <button onClick={() => nav(`/produto/${i.product_id}`)} className="h-20 w-20 rounded-lg bg-surface-2 overflow-hidden shrink-0">
                  {i.product?.image_url ? (
                    <img src={i.product.image_url} alt={i.product.name} className="h-full w-full object-cover" />
                  ) : <div className="h-full w-full flex items-center justify-center text-muted-foreground"><ShoppingBag className="h-6 w-6" /></div>}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{i.product?.name ?? 'Produto'}</div>
                  <div className="text-sm text-muted-foreground">{formatBRL(i.product?.price ?? 0)}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(i, -1)}><Minus className="h-3 w-3" /></Button>
                    <span className="text-sm w-8 text-center">{i.quantity}</span>
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(i, +1)}><Plus className="h-3 w-3" /></Button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold">{formatBRL(Number(i.product?.price ?? 0) * i.quantity)}</div>
                  <Button onClick={() => remove(i)} variant="ghost" size="sm" className="text-destructive hover:text-destructive mt-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="surface-1 border-border/50 p-6 h-fit sticky top-24 space-y-4">
            <h3 className="font-display text-lg font-semibold">Resumo</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatBRL(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxas</span>
              <span>Calculadas no checkout</span>
            </div>
            <div className="border-t border-border/50 pt-3 flex justify-between font-display text-lg font-bold">
              <span>Total</span>
              <span className="text-gradient">{formatBRL(total)}</span>
            </div>
            <Button onClick={checkout} disabled={checking} className="w-full gradient-primary border-0 text-white h-11">
              {checking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Finalizar compra
            </Button>
            <p className="text-xs text-muted-foreground text-center">Você será redirecionado para o Mercado Pago.</p>
          </Card>
        </div>
      )}
    </div>
  );
}
