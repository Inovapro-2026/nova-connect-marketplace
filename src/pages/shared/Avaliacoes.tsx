import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MessageSquare } from 'lucide-react';
import { formatDate } from '@/lib/format';

interface Avaliacao {
  id: string; nota: number; comentario: string | null; created_at: string | null;
  resposta_vendedor: string | null;
}

interface Props { mode: 'cliente' | 'vendedor'; }

export default function Avaliacoes({ mode }: Props) {
  const { user } = useAuth();
  const [list, setList] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Avaliações — InovaPro Shop';
    if (!user) return;
    (async () => {
      const { data: u } = await supabase.from('usuarios').select('id').eq('auth_user_id', user.id).maybeSingle();
      if (!u) { setLoading(false); return; }

      let q = supabase.from('avaliacoes')
        .select('id, nota, comentario, created_at, resposta_vendedor')
        .order('created_at', { ascending: false });

      if (mode === 'cliente') {
        q = q.eq('cliente_id', u.id);
      } else {
        const { data: pv } = await supabase.from('perfis_vendedor').select('id').eq('usuario_id', u.id).maybeSingle();
        if (!pv) { setLoading(false); return; }
        q = q.eq('vendedor_id', pv.id);
      }

      const { data } = await q;
      setList((data as Avaliacao[]) ?? []);
      setLoading(false);
    })();
  }, [user, mode]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Avaliações</h1>
        <p className="text-muted-foreground">{mode === 'cliente' ? 'Suas avaliações sobre vendedores' : 'O que clientes dizem sobre você'}</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : list.length === 0 ? (
        <Card className="surface-1 border-border/50 p-12 text-center">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold mb-1">Nenhuma avaliação ainda</h3>
          <p className="text-sm text-muted-foreground">As avaliações aparecerão aqui após pedidos concluídos.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <Card key={a.id} className="surface-1 border-border/50 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < a.nota ? 'fill-warning text-warning' : 'text-muted-foreground/40'}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(a.created_at)}</span>
              </div>
              {a.comentario && <p className="text-sm text-muted-foreground">{a.comentario}</p>}
              {a.resposta_vendedor && (
                <div className="mt-3 pl-3 border-l-2 border-primary/40">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Resposta</div>
                  <p className="text-sm">{a.resposta_vendedor}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
