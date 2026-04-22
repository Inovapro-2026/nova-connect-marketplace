import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Package, ListOrdered, DollarSign, Star } from 'lucide-react';
import { formatBRL } from '@/lib/format';

export default function VendedorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ produtos: 0, pedidos: 0, faturamento: 0, nota: 0 });

  useEffect(() => {
    document.title = 'Painel do Vendedor — InovaPro Shop';
    if (!user) return;
    (async () => {
      // 1. Get user profile
      const { data: u } = await supabase.from('usuarios').select('id').eq('auth_user_id', user.id).maybeSingle();
      if (!u) return;

      // 2. Get seller profile
      const { data: pv } = await supabase.from('perfis_vendedor').select('id, avaliacao_media').eq('usuario_id', u.id).maybeSingle();
      if (!pv) return;

      // 3. Fetch stats
      const [pRes, oRes, fRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('seller_id', pv.id).eq('status', 'published'),
        supabase.from('pedidos').select('id', { count: 'exact', head: true }).eq('vendedor_id', pv.id),
        supabase.from('pedidos').select('valor_liquido_vendedor').eq('vendedor_id', pv.id).neq('status', 'cancelado')
      ]);

      const faturamento = (fRes.data as any[])?.reduce((acc, curr) => acc + Number(curr.valor_liquido_vendedor || 0), 0) || 0;

      setStats({
        produtos: pRes.count ?? 0,
        pedidos: oRes.count ?? 0,
        faturamento: faturamento,
        nota: Number(pv.avaliacao_media ?? 0),
      });
    })();
  }, [user]);

  const cards = [
    { label: 'Produtos ativos', value: stats.produtos, icon: Package, color: 'text-primary' },
    { label: 'Pedidos', value: stats.pedidos, icon: ListOrdered, color: 'text-accent' },
    { label: 'Faturamento', value: formatBRL(stats.faturamento), icon: DollarSign, color: 'text-success' },
    { label: 'Avaliação', value: stats.nota.toFixed(1), icon: Star, color: 'text-warning' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Olá, vendedor</h1>
        <p className="text-muted-foreground">Resumo da sua loja</p>
      </div>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="surface-1 border-border/50 p-5">
            <c.icon className={`h-6 w-6 mb-3 ${c.color}`} />
            <div className="text-2xl font-display font-bold">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </Card>
        ))}
      </div>
      <Card className="surface-1 border-border/50 p-8 text-center">
        <h2 className="font-display text-xl font-semibold mb-2">Painel Operacional Ativo</h2>
        <p className="text-muted-foreground">O cadastro de produtos, gestão de pedidos, financeiro e saques já estão disponíveis nesta versão.</p>
      </Card>
    </div>
  );
}
