import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, MessageCircle, ArrowLeft, User, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Chat {
  id: string; customer_id: string; seller_id: string; product_id: string | null; order_id: string | null; status_atendimento: string; created_at: string;
  other?: { id: string; nome: string; sobrenome: string | null; avatar_url: string | null };
  product?: { id: string; name: string; image_url: string | null; item_type: string; price: number; seller_id: string };
  lastMsg?: string;
}

interface Message {
  id: string; chat_id: string; sender_id: string; content: string; read: boolean; created_at: string;
}

interface Props { basePath: string; }

export function MensagensLista({ basePath }: Props) {
  const { user } = useAuth();
  const [list, setList] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Mensagens — InovaPro Shop';
    if (!user) return;
    (async () => {
      const { data: u } = await supabase.from('usuarios').select('id').eq('auth_user_id', user.id).maybeSingle();
      if (!u) { setLoading(false); return; }
      const { data } = await supabase.from('chats')
        .select('id, customer_id, seller_id, product_id, order_id, status_atendimento, created_at')
        .or(`customer_id.eq.${u.id},seller_id.eq.${u.id}`)
        .order('created_at', { ascending: false });

      const chats = (data ?? []) as Chat[];
      const otherIds = chats.map((c) => c.customer_id === u.id ? c.seller_id : c.customer_id);
      const productIds = chats.map((c) => c.product_id).filter(Boolean) as string[];

      const [usersR, prodsR] = await Promise.all([
        otherIds.length ? supabase.from('usuarios').select('id, nome, sobrenome, avatar_url').in('id', otherIds) : Promise.resolve({ data: [] }),
        productIds.length ? supabase.from('products').select('id, name, image_url, item_type, price, seller_id').in('id', productIds) : Promise.resolve({ data: [] }),
      ]);

      const uMap = new Map((usersR.data ?? []).map((x: any) => [x.id, x]));
      const pMap = new Map((prodsR.data ?? []).map((x: any) => [x.id, x]));

      chats.forEach((c) => {
        const otherId = c.customer_id === u.id ? c.seller_id : c.customer_id;
        c.other = uMap.get(otherId) as any;
        if (c.product_id) c.product = pMap.get(c.product_id) as any;
      });

      setList(chats);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Mensagens</h1>
        <p className="text-muted-foreground">Conversas com {basePath.includes('cliente') ? 'vendedores' : 'clientes'}</p>
      </div>
      {list.length === 0 ? (
        <Card className="surface-1 border-border/50 p-12 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold mb-1">Sem conversas ainda</h3>
          <p className="text-sm text-muted-foreground">Inicie uma conversa pela página de um item ou serviço.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {list.map((c) => (
            <Link key={c.id} to={`${basePath}/${c.id}`}>
              <Card className="surface-1 border-border/50 p-4 flex items-center gap-3 hover:border-primary/60 transition-colors">
                <div className="h-11 w-11 rounded-full bg-surface-2 overflow-hidden flex items-center justify-center border border-border/50">
                  {c.other?.avatar_url ? <img src={c.other.avatar_url} alt="" className="h-full w-full object-cover" /> : <User className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{c.other?.nome ?? 'Usuário'} {c.other?.sobrenome ?? ''}</div>
                  <div className="text-xs text-muted-foreground truncate flex items-center gap-2">
                    {c.product?.item_type === 'servico' && <Badge variant="outline" className="text-[8px] h-4 py-0 px-1 border-primary/50 text-primary uppercase">Serviço</Badge>}
                    {c.product?.name ?? 'Conversa'}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <div className="text-[10px] text-muted-foreground">{formatDate(c.created_at)}</div>
                   {c.status_atendimento !== 'aberto' && (
                     <Badge variant="secondary" className="text-[8px] h-4 py-0 px-1 font-bold uppercase">
                       {c.status_atendimento.replace('_', ' ')}
                     </Badge>
                   )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function MensagensThread({ basePath }: Props) {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [meId, setMeId] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [other, setOther] = useState<{ id: string; nome: string; avatar_url: string | null } | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [acting, setActing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isClient = basePath.includes('cliente');

  const fetchData = async () => {
    if (!user || !id) return;
    const { data: u } = await supabase.from('usuarios').select('id').eq('auth_user_id', user.id).maybeSingle();
    if (!u) return;
    setMeId(u.id);

    const { data: cData } = await supabase.from('chats')
      .select('*, products(*)').eq('id', id).maybeSingle();
    
    if (!cData) { nav(basePath); return; }
    
    const mappedChat: Chat = {
      ...cData,
      product: cData.products
    };
    setChat(mappedChat);

    const otherId = cData.customer_id === u.id ? cData.seller_id : cData.customer_id;
    const { data: ou } = await supabase.from('usuarios').select('id, nome, avatar_url').eq('id', otherId).maybeSingle();
    setOther(ou as any);

    const { data: m } = await supabase.from('chat_messages')
      .select('*').eq('chat_id', id).order('created_at', { ascending: true });
    setMsgs((m as Message[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const ch = supabase.channel(`chat:${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${id}` },
        (payload) => {
          setMsgs((m) => [...m, payload.new as Message]);
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chats', filter: `id=eq.${id}` }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [id, user, basePath]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !id || !meId) return;
    setSending(true);
    const { error } = await supabase.from('chat_messages').insert({ chat_id: id, sender_id: meId, content: text.trim() });
    setSending(false);
    if (!error) setText('');
  };

  const handleMarcarEntregue = async () => {
    if (!chat || acting) return;
    setActing(true);
    try {
      const { error } = await supabase.from('chats').update({ status_atendimento: 'entregue' }).eq('id', chat.id);
      if (error) throw error;
      
      // Send system message
      await supabase.from('chat_messages').insert({
        chat_id: chat.id,
        sender_id: meId!,
        content: '✅ SERVIÇO ENTREGUE! Por favor, confirme o recebimento para finalizar.'
      });
      
      toast.success('Serviço marcado como entregue!');
    } catch (err) {
      toast.error('Erro ao atualizar status');
    } finally {
      setActing(false);
    }
  };

  const handleConfirmarEntrega = async () => {
    if (!chat || acting) return;
    setActing(true);
    try {
      const { error } = await supabase.from('chats').update({ status_atendimento: 'encerrado' }).eq('id', chat.id);
      if (error) throw error;
      
      // Update order status if exists
      if (chat.order_id) {
        await supabase.from('pedidos').update({ status: 'concluido', status_servico: 'concluido' }).eq('id', chat.order_id);
      }

      await supabase.from('chat_messages').insert({
        chat_id: chat.id,
        sender_id: meId!,
        content: '🤝 ENTREGA CONFIRMADA! Serviço finalizado com sucesso.'
      });

      toast.success('Serviço finalizado!');
    } catch (err) {
      toast.error('Erro ao confirmar entrega');
    } finally {
      setActing(false);
    }
  };

  const handleContratar = () => {
    if (!chat?.product) return;
    // In a real app, this would go to a checkout page with the product_id and chat_id
    // For this prototype, let's simulate a checkout trigger or redirect
    toast.info('Redirecionando para o pagamento...');
    // Simulated checkout route
    nav(`/app/cliente/carrinho?direct=${chat.product.id}&chat=${chat.id}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => nav(basePath)}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="h-10 w-10 rounded-full bg-surface-2 overflow-hidden flex items-center justify-center border border-border/50">
            {other?.avatar_url ? <img src={other.avatar_url} alt="" className="h-full w-full object-cover" /> : <User className="h-5 w-5 text-muted-foreground" />}
          </div>
          <div>
            <div className="font-bold leading-none mb-1">{other?.nome ?? 'Conversa'}</div>
            {chat?.product && (
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="font-bold text-primary truncate max-w-[150px]">{chat.product.name}</span>
                {chat.product.item_type === 'servico' && <Badge variant="outline" className="text-[8px] h-3 py-0 px-1 border-primary/30">Serviço</Badge>}
              </div>
            )}
          </div>
        </div>

        {/* Contextual Actions */}
        <div className="flex gap-2">
          {chat?.product?.item_type === 'servico' && (
            <>
              {isClient ? (
                <>
                  {!chat.order_id && chat.status_atendimento === 'aberto' && (
                    <Button size="sm" className="gradient-primary border-0 text-white font-bold h-8 px-4" onClick={handleContratar}>
                      Contratar
                    </Button>
                  )}
                  {chat.status_atendimento === 'entregue' && (
                    <Button size="sm" variant="outline" className="border-success text-success hover:bg-success/5 font-bold h-8 px-4" onClick={handleConfirmarEntrega} disabled={acting}>
                      Confirmar Entrega
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {chat.status_atendimento === 'em_andamento' && (
                    <Button size="sm" className="bg-success hover:bg-success/90 border-0 text-white font-bold h-8 px-4" onClick={handleMarcarEntregue} disabled={acting}>
                      Marcar Entregue
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 px-2">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-12 w-1/2 ml-auto" />
            <Skeleton className="h-12 w-2/3" />
          </div>
        ) : msgs.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Alinhe os detalhes do serviço por aqui.</p>
          </div>
        ) : msgs.map((m) => {
          const mine = m.sender_id === meId;
          const isSystem = m.content.startsWith('✅') || m.content.startsWith('🤝');
          
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'} ${isSystem ? 'justify-center my-4' : ''}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all ${
                isSystem ? 'bg-muted/50 border border-border/50 text-muted-foreground text-center text-xs' :
                mine ? 'bg-primary text-white rounded-tr-none' : 'surface-2 border border-border/50 rounded-tl-none text-foreground'
              }`}>
                <p className="whitespace-pre-wrap break-words leading-relaxed">{m.content}</p>
                {!isSystem && (
                  <span className={`block text-[9px] mt-1 text-right ${mine ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {chat?.status_atendimento !== 'encerrado' ? (
        <form onSubmit={send} className="flex gap-2 pt-3 border-t border-border/50 sticky bottom-0 bg-background/80 backdrop-blur-sm">
          <Input 
            placeholder="Digite sua mensagem..." 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            disabled={sending}
            className="h-12 rounded-xl focus:ring-primary/20"
          />
          <Button type="submit" disabled={sending || !text.trim()} className="gradient-primary border-0 text-white h-12 w-12 rounded-xl p-0">
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      ) : (
        <div className="py-4 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/50">
          Esta conversa foi finalizada. O serviço foi concluído.
        </div>
      )}
    </div>
  );
}
