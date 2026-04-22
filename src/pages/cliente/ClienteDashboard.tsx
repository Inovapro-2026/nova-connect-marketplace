import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Package, Heart, ShoppingBag, Star } from 'lucide-react';

export default function ClienteDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ pedidos: 0, favoritos: 0, carrinho: 0, avaliacoes: 0 });

  useEffect(() => {
    document.title = 'Painel — InovaPro Shop';
    if (!user) return;
    Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('customer_id', user.id),
      supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('cart_items').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('avaliacoes').select('id', { count: 'exact', head: true }),
    ]).then(([o, f, c, a]) => setStats({
      pedidos: o.count ?? 0, favoritos: f.count ?? 0, carrinho: c.count ?? 0, avaliacoes: a.count ?? 0,
    }));
  }, [user]);

  const cards = [
    { label: 'Pedidos', value: stats.pedidos, icon: Package, color: 'text-primary' },
    { label: 'Favoritos', value: stats.favoritos, icon: Heart, color: 'text-destructive' },
    { label: 'Carrinho', value: stats.carrinho, icon: ShoppingBag, color: 'text-accent' },
    { label: 'Avaliações', value: stats.avaliacoes, icon: Star, color: 'text-warning' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Bem-vindo de volta</h1>
        <p className="text-muted-foreground">Aqui está um resumo da sua conta</p>
      </div>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="surface-1 border-border/50 p-5">
            <c.icon className={`h-6 w-6 mb-3 ${c.color}`} />
            <div className="text-3xl font-display font-bold">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </Card>
        ))}
      </div>
      <Card className="surface-1 border-border/50 p-8 text-center">
        <h2 className="font-display text-xl font-semibold mb-2">Mais funcionalidades em breve</h2>
        <p className="text-muted-foreground">Os pedidos, mensagens e checkout completo serão entregues nas próximas fases.</p>
      </Card>
    </div>
  );
}
