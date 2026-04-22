import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import { formatBRL, formatDate } from '@/lib/format';

interface Cliente {
  id: string; nome: string; sobrenome: string | null; email: string;
  total_pedidos: number | null; total_gasto: number | null;
  ultima_compra_em: string | null; status: string | null;
}

export default function ClientesVendedor() {
  const { user } = useAuth();
  const [list, setList] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Clientes — InovaPro Shop';
    if (!user) return;
    (async () => {
      const { data: u } = await supabase.from('usuarios').select('id').eq('auth_user_id', user.id).maybeSingle();
      if (!u) { setLoading(false); return; }
      const { data: pv } = await supabase.from('perfis_vendedor').select('id').eq('usuario_id', u.id).maybeSingle();
      if (!pv) { setLoading(false); return; }
      const { data } = await supabase.from('clientes')
        .select('id, nome, sobrenome, email, total_pedidos, total_gasto, ultima_compra_em, status')
        .eq('seller_id', pv.id).order('created_at', { ascending: false });
      setList((data as Cliente[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Clientes</h1>
        <p className="text-muted-foreground">Sua base de compradores</p>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : list.length === 0 ? (
        <Card className="surface-1 border-border/50 p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold mb-1">Nenhum cliente registrado</h3>
          <p className="text-sm text-muted-foreground">À medida que você vender, seus clientes aparecerão aqui.</p>
        </Card>
      ) : (
        <Card className="surface-1 border-border/50 overflow-hidden">
          <div className="divide-y divide-border/50">
            {list.map((c) => (
              <div key={c.id} className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-sm font-semibold text-white">
                  {c.nome[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{c.nome} {c.sobrenome ?? ''}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.email}</div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-display font-semibold text-base text-foreground">{formatBRL(c.total_gasto ?? 0)}</div>
                  <div className="text-muted-foreground">{c.total_pedidos ?? 0} pedidos • {formatDate(c.ultima_compra_em)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
