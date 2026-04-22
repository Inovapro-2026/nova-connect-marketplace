import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Users, Store, Package, ListOrdered } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ usuarios: 0, vendedores: 0, produtos: 0, pedidos: 0 });

  useEffect(() => {
    document.title = 'Admin — InovaPro Shop';
    Promise.all([
      supabase.from('usuarios').select('id', { count: 'exact', head: true }),
      supabase.from('perfis_vendedor').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('pedidos').select('id', { count: 'exact', head: true }),
    ]).then(([u, v, p, o]) => setStats({
      usuarios: u.count ?? 0, vendedores: v.count ?? 0, produtos: p.count ?? 0, pedidos: o.count ?? 0,
    }));
  }, []);

  const cards = [
    { label: 'Usuários', value: stats.usuarios, icon: Users, color: 'text-primary' },
    { label: 'Vendedores', value: stats.vendedores, icon: Store, color: 'text-accent' },
    { label: 'Produtos', value: stats.produtos, icon: Package, color: 'text-warning' },
    { label: 'Pedidos', value: stats.pedidos, icon: ListOrdered, color: 'text-success' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Administração</h1>
        <p className="text-muted-foreground">Visão geral da plataforma</p>
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
        <h2 className="font-display text-xl font-semibold mb-2">Painel admin completo na Fase 3</h2>
        <p className="text-muted-foreground">Gestão de usuários, moderação, financeiro e configurações virão a seguir.</p>
      </Card>
    </div>
  );
}
