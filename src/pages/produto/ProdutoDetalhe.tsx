import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PublicHeader, PublicFooter } from '@/components/PublicShell';
import { Heart, MessageCircle, ShoppingCart, Star, Store, Loader2, Package, ArrowLeft } from 'lucide-react';
import { formatBRL } from '@/lib/format';
import { toast } from 'sonner';

interface ProdutoDetalheData {
  id: string; name: string; description: string | null; price: number;
  image_url: string | null; category: string | null; seller_id: string;
  status: string; item_type: 'produto' | 'servico';
}

interface Vendedor {
  id: string; nome: string; sobrenome: string | null; avatar_url: string | null;
}

interface PerfilV {
  avaliacao_media: number | null; total_avaliacoes: number | null; nome_profissional: string | null;
}

export default function ProdutoDetalhe() {
  const { id } = useParams();
  const { user, role } = useAuth();
  const nav = useNavigate();

  const [produto, setProduto] = useState<ProdutoDetalheData | null>(null);
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [perfilV, setPerfilV] = useState<PerfilV | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorito, setFavorito] = useState(false);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    (async () => {
      const { data: p, error } = await (supabase.from('products') as any).select('*').eq('id', id).maybeSingle();
      if (error || !p) { setProduto(null); setLoading(false); return; }
      setProduto(p as unknown as ProdutoDetalheData);
      document.title = `${p.name} — InovaPro Shop`;

      // The seller_id in products is the auth_user_id (owner)
      const { data: u } = await supabase.from('usuarios')
        .select('id, nome, sobrenome, avatar_url')
        .eq('auth_user_id', p.seller_id).maybeSingle();
      
      if (u) {
        setVendedor(u as Vendedor);
        const { data: pv } = await supabase.from('perfis_vendedor')
          .select('avaliacao_media, total_avaliacoes, nome_profissional')
          .eq('usuario_id', u.id).maybeSingle();
        if (pv) setPerfilV(pv as PerfilV);
      }

      if (user) {
        const { data: fav } = await supabase.from('favorites')
          .select('id').eq('user_id', user.id).eq('product_id', id).maybeSingle();
        setFavorito(!!fav);
      }
      setLoading(false);
    })();
  }, [id, user]);

  const requireAuth = () => {
    if (!user) {
      toast.error('Faça login para continuar');
      nav('/auth/login', { state: { from: `/produto/${id}` } });
      return false;
    }
    if (role !== 'cliente') {
      toast.error('Apenas clientes podem realizar esta ação');
      return false;
    }
    return true;
  };

  const toggleFavorito = async () => {
    if (!requireAuth() || !produto) return;
    setActing(true);
    if (favorito) {
      await supabase.from('favorites').delete().eq('user_id', user!.id).eq('product_id', produto.id);
      setFavorito(false);
      toast.success('Removido dos favoritos');
    } else {
      const { error } = await supabase.from('favorites').insert({ user_id: user!.id, product_id: produto.id });
      if (error) toast.error('Erro ao favoritar');
      else { setFavorito(true); toast.success('Adicionado aos favoritos'); }
    }
    setActing(false);
  };

  const adicionarCarrinho = async () => {
    if (!requireAuth() || !produto) return;
    setActing(true);
    const { data: existing } = await supabase.from('cart_items')
      .select('id, quantity').eq('user_id', user!.id).eq('product_id', produto.id).maybeSingle();
    if (existing) {
      await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({ user_id: user!.id, product_id: produto.id, quantity: 1 });
    }
    setActing(false);
    toast.success('Adicionado ao carrinho');
  };

  const iniciarChat = async () => {
    if (!requireAuth() || !produto || !vendedor) return;
    setActing(true);
    try {
      const { data: cli } = await supabase.from('usuarios').select('id').eq('auth_user_id', user!.id).maybeSingle();
      if (!cli) throw new Error('Perfil do cliente não encontrado');

      // Check if chat already exists for this product
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('customer_id', cli.id)
        .eq('seller_id', vendedor.id)
        .eq('product_id', produto.id)
        .maybeSingle();

      if (existingChat) {
        nav(`/app/cliente/mensagens/${existingChat.id}`);
        return;
      }

      // Start secure chat with product linkage
      const { data: chat, error } = await (supabase.rpc as any)('start_chat_seguro_v2', {
        p_customer_raw_id: cli.id,
        p_seller_raw_id: vendedor.id,
        p_product_id: produto.id,
      });

      if (error) throw error;
      const c = Array.isArray(chat) ? chat[0] : chat;
      if (c?.id) nav(`/app/cliente/mensagens/${c.id}`);
    } catch (err: any) {
      toast.error('Erro ao abrir chat: ' + err.message);
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        <PublicFooter />
      </div>
    );
  }

  if (!produto || produto.status !== 'published') {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <div className="flex-1 container py-20 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Indisponível</h1>
          <p className="text-muted-foreground mb-6">Este item pode ter sido removido ou está oculto.</p>
          <Button asChild className="gradient-primary border-0 text-white"><Link to="/">Ver vitrine</Link></Button>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const isServico = produto.item_type === 'servico';

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 container py-8">
        <Button variant="ghost" size="sm" onClick={() => nav(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <Card className="surface-1 border-border/50 overflow-hidden group">
              <div className="aspect-square bg-surface-2 flex items-center justify-center relative">
                {produto.image_url ? (
                  <img src={produto.image_url} alt={produto.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <Package className="h-20 w-20 text-muted-foreground" />
                )}
                {isServico && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-white border-0 shadow-lg px-3 py-1">SERVIÇO</Badge>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              {produto.category && <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold">{produto.category}</Badge>}
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-bold">{isServico ? 'Prestação de Serviço' : 'Produto Digital'}</Badge>
            </div>
            
            <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight">{produto.name}</h1>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-black text-primary">{formatBRL(produto.price)}</span>
              {isServico && <span className="text-muted-foreground text-sm font-medium">/ serviço</span>}
            </div>

            {isServico && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <MessageCircle className="h-4 w-4" />
                  Alinhamento Obrigatório
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Este é um serviço personalizado. Você deve conversar com o profissional para alinhar detalhes antes de prosseguir com a contratação e pagamento.
                </p>
              </div>
            )}

            {produto.description && (
              <Card className="surface-1 border-border/50 p-6 rounded-2xl">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Sobre o {isServico ? 'serviço' : 'produto'}
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{produto.description}</p>
              </Card>
            )}

            {vendedor && (
              <Card className="surface-1 border-border/50 p-4 rounded-2xl flex items-center gap-4 group cursor-pointer hover:border-primary/30 transition-all">
                <div className="h-14 w-14 rounded-full overflow-hidden bg-surface-2 flex items-center justify-center border-2 border-border/50 group-hover:border-primary/50 transition-all">
                  {vendedor.avatar_url ? (
                    <img src={vendedor.avatar_url} alt={vendedor.nome} className="h-full w-full object-cover" />
                  ) : (
                    <Store className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate text-lg">
                    {perfilV?.nome_profissional || `${vendedor.nome} ${vendedor.sobrenome ?? ''}`.trim()}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`h-3 w-3 ${i <= (perfilV?.avaliacao_media || 0) ? 'fill-warning text-warning' : 'text-muted/30'}`} />
                      ))}
                    </div>
                    <span className="font-bold text-foreground">{Number(perfilV?.avaliacao_media ?? 0).toFixed(1)}</span>
                    <span className="text-muted-foreground">({perfilV?.total_avaliacoes ?? 0} avaliações)</span>
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-3 pt-4">
              {isServico ? (
                <Button onClick={iniciarChat} disabled={acting}
                  className="w-full gradient-primary border-0 text-white h-14 text-lg font-bold shadow-[0_8px_20px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <MessageCircle className="h-6 w-6 mr-3" /> Conversar com Profissional
                </Button>
              ) : (
                <>
                  <Button onClick={adicionarCarrinho} disabled={acting}
                    className="w-full gradient-primary border-0 text-white h-14 text-lg font-bold shadow-[0_8px_20px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <ShoppingCart className="h-6 w-6 mr-3" /> Adicionar ao carrinho
                  </Button>
                  <Button onClick={() => { adicionarCarrinho(); nav('/app/cliente/carrinho'); }} variant="outline" className="w-full h-12 font-semibold">
                    Comprar Agora
                  </Button>
                </>
              )}
              
              <div className="grid grid-cols-1 gap-2">
                <Button onClick={toggleFavorito} variant="ghost" disabled={acting} className="h-12 font-medium text-muted-foreground hover:text-foreground">
                  <Heart className={`h-5 w-5 mr-2 ${favorito ? 'fill-destructive text-destructive' : ''}`} />
                  {favorito ? 'Item Favoritado' : 'Salvar nos Favoritos'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
