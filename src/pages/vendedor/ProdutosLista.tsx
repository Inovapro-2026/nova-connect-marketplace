import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Package, Eye, EyeOff } from 'lucide-react';
import { formatBRL } from '@/lib/format';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Produto {
  id: string; 
  name: string; 
  price: number; 
  image_url: string | null;
  categoria_id: string | null; 
  status: string;
  item_type: 'produto' | 'servico';
  created_at: string | null;
}

export default function ProdutosLista() {
  const { user } = useAuth();
  const [list, setList] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Produto | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    
    // 1. Resolve usuario ID e Perfil Vendedor
    const { data: u } = await supabase.from('usuarios').select('id').eq('auth_user_id', user.id).maybeSingle();
    if (!u) { setLoading(false); return; }
    
    const { data: pv } = await supabase.from('perfis_vendedor').select('id').eq('usuario_id', u.id).maybeSingle();
    if (!pv) { setLoading(false); return; }

    // 2. Fetch from products
    const { data: prods, error: errP } = await supabase.from('products')
      .select('id, name, price, image_url, categoria_id, status, item_type, created_at')
      .eq('seller_id', pv.id)
      .order('created_at', { ascending: false });

    // 3. Fetch from servicos
    const { data: servs, error: errS } = await supabase.from('servicos')
      .select('id, titulo, preco_base, imagem_principal_url, categoria_id, status, created_at')
      .eq('vendedor_id', pv.id)
      .order('created_at', { ascending: false });
    
    if (errP || errS) toast.error('Erro ao carregar itens');

    const unified: Produto[] = [
      ...(prods?.map(p => ({ ...p, item_type: 'produto' as const })) || []),
      ...(servs?.map(s => ({
        id: s.id,
        name: s.titulo,
        price: s.preco_base,
        image_url: s.imagem_principal_url,
        categoria_id: s.categoria_id,
        status: s.status === 'publicado' ? 'published' : 'draft',
        item_type: 'servico' as const,
        created_at: s.created_at
      })) || [])
    ].sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());

    setList(unified);
    setLoading(false);
  };

  useEffect(() => { document.title = 'Meus Itens — InovaPro Shop'; load(); /* eslint-disable-next-line */ }, [user]);

  const togglePublish = async (p: Produto) => {
    const table = p.item_type === 'produto' ? 'products' : 'servicos';
    const currentStatus = p.item_type === 'produto' 
      ? (p.status === 'published' ? 'published' : 'draft')
      : (p.status === 'published' ? 'publicado' : 'rascunho');
    
    const nextStatus = p.item_type === 'produto'
      ? (p.status === 'published' ? 'draft' : 'published')
      : (p.status === 'published' ? 'rascunho' : 'publicado');

    const { error } = await supabase.from(table).update({ status: nextStatus }).eq('id', p.id);
    if (error) return toast.error('Não foi possível atualizar');
    toast.success(p.status === 'published' ? 'Desativado' : 'Ativado');
    load();
  };

  const remove = async () => {
    if (!toDelete) return;
    const table = toDelete.item_type === 'produto' ? 'products' : 'servicos';
    const { error } = await supabase.from(table).delete().eq('id', toDelete.id);
    if (error) toast.error('Erro ao excluir');
    else toast.success('Excluído com sucesso');
    setToDelete(null);
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Gerenciar Itens</h1>
          <p className="text-muted-foreground">Produtos e serviços cadastrados</p>
        </div>
        <Button asChild className="gradient-primary border-0 text-white shadow-lg shadow-primary/20">
          <Link to="/app/vendedor/produtos/novo"><Plus className="h-4 w-4 mr-1" /> Novo Item</Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="surface-1 border-border/50 p-4"><Skeleton className="h-48 w-full mb-4" /><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></Card>
          ))}
        </div>
      ) : list.length === 0 ? (
        <Card className="surface-1 border-border/50 p-16 text-center rounded-3xl">
          <div className="h-16 w-16 bg-surface-2 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">Nada por aqui</h3>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Cadastre seu primeiro produto ou serviço para começar a aparecer no marketplace.</p>
          <Button asChild size="lg" className="gradient-primary border-0 text-white rounded-xl">
            <Link to="/app/vendedor/produtos/novo"><Plus className="h-5 w-5 mr-2" /> Começar Agora</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <Card key={p.id} className="surface-1 border-border/50 overflow-hidden flex flex-col group hover:border-primary/30 transition-all rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1">
              <div className="relative aspect-[4/3] bg-surface-2 overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <Package className="h-12 w-12 opacity-20" />
                  </div>
                )}
                
                {/* Type Badge */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className={`border-0 font-bold px-2 py-0.5 shadow-lg ${
                    p.item_type === 'servico' ? 'bg-primary text-white' : 'bg-secondary text-foreground'
                  }`}>
                    {p.item_type === 'servico' ? 'SERVIÇO' : 'PRODUTO'}
                  </Badge>
                </div>

                <div className="absolute top-3 right-3">
                  <Badge className={`border-0 font-bold px-2 py-0.5 shadow-lg ${
                    p.status === 'published' ? 'bg-success text-white' :
                    p.status === 'draft' ? 'bg-warning text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {p.status === 'published' ? 'Ativo' : p.status === 'draft' ? 'Rascunho' : 'Oculto'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex-1">
                   <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">
                      {p.item_type === 'servico' ? 'Serviço' : 'Produto'}
                   </div>
                   <h3 className="font-bold text-lg line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">{p.name}</h3>
                   <div className="text-2xl font-display font-black text-foreground">{formatBRL(p.price)}</div>
                </div>

                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border/50">
                  <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl h-10 font-bold">
                    <Link to={`/app/vendedor/produtos/${p.id}/editar`}><Pencil className="h-4 w-4 mr-2" />Editar</Link>
                  </Button>
                  <Button onClick={() => togglePublish(p)} variant="outline" size="icon" className="h-10 w-10 rounded-xl" title={p.status === 'published' ? 'Desativar' : 'Ativar'}>
                    {p.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button onClick={() => setToDelete(p)} variant="outline" size="icon" className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso removerá "{toDelete?.name}" do marketplace. Todos os dados associados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-white hover:bg-destructive/90 rounded-xl">Sim, Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
