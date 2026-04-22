import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bell, Mail, Download, 
  Trash2, AlertCircle, Info
} from 'lucide-react';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';

interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  tipo: string;
  created_at: string;
  arquivo_url?: string;
  arquivo_nome?: string;
}

export default function Avisos() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Trying the new 'avisos' table first
      let { data, error } = await supabase
        .from('avisos')
        .select('*')
        .or(`target_usuario_id.is.null,target_usuario_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback to 'notificacoes'
        const { data: oldData, error: oldError } = await supabase
          .from('notificacoes')
          .select('*')
          .eq('usuario_id', user.id)
          .order('created_at', { ascending: false });
        
        if (oldError) throw oldError;
        data = oldData;
      }

      if (filter === 'unread') {
        data = data?.filter(n => !n.lida) || [];
      }

      setNotifications(data || []);
    } catch (err) {
      console.error('Error loading avisos:', err);
      toast.error('Erro ao carregar avisos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Avisos e Notificações — InovaPro Shop';
    load();
  }, [user, filter]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase.from('avisos').update({ lida: true }).eq('id', id);
      if (error) {
         await supabase.from('notificacoes').update({ lida: true }).eq('id', id);
      }
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase.from('avisos').delete().eq('id', id);
      if (error) {
         await supabase.from('notificacoes').delete().eq('id', id);
      }
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Aviso removido');
    } catch (err) {
      toast.error('Erro ao excluir aviso');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight">Avisos e Notificações</h1>
          <p className="text-muted-foreground text-lg">Acompanhe comunicações importantes e atualizações do sistema</p>
        </div>
        <div className="flex bg-surface-1 p-1 rounded-xl border border-border/50">
          <Button 
            variant={filter === 'all' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setFilter('all')}
            className="rounded-lg font-bold"
          >
            Todos
          </Button>
          <Button 
            variant={filter === 'unread' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setFilter('unread')}
            className="rounded-lg font-bold"
          >
            Não lidos
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="surface-1 border-border/50 p-20 text-center rounded-3xl">
          <div className="h-20 w-20 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <h3 className="font-display text-2xl font-bold mb-2">Tudo limpo por aqui!</h3>
          <p className="text-muted-foreground">Você não possui novos avisos no momento.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notifications.map((n) => (
            <Card 
              key={n.id} 
              className={`surface-1 border-border/50 overflow-hidden rounded-2xl transition-all hover:shadow-xl hover:border-primary/30 group ${!n.lida ? 'border-l-4 border-l-primary' : ''}`}
              onClick={() => !n.lida && markAsRead(n.id)}
            >
              <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className={`h-14 w-14 rounded-2xl shrink-0 flex items-center justify-center shadow-lg ${
                  n.tipo === 'sistema' ? 'bg-amber-500 text-white' : 
                  n.tipo === 'financeiro' ? 'bg-green-500 text-white' : 'bg-primary text-white'
                }`}>
                  {n.tipo === 'sistema' ? <AlertCircle className="h-7 w-7" /> : 
                   n.tipo === 'financeiro' ? <Info className="h-7 w-7" /> : <Mail className="h-7 w-7" />}
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <h3 className={`text-xl font-bold tracking-tight ${!n.lida ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {n.titulo}
                      </h3>
                      {!n.lida && <Badge variant="secondary" className="rounded-full bg-primary/20 text-primary border-0 font-bold uppercase text-[10px]">Novo</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                       {formatDate(n.created_at)}
                    </span>
                  </div>
                  
                  <p className={`text-base leading-relaxed ${!n.lida ? 'text-muted-foreground font-medium' : 'text-muted-foreground/70'}`}>
                    {n.mensagem}
                  </p>
                  
                  {n.arquivo_url && (
                    <div className="pt-4 flex flex-wrap gap-3">
                       <Button 
                         variant="outline" 
                         className="rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold h-11"
                         onClick={(e) => {
                            e.stopPropagation();
                            window.open(n.arquivo_url, '_blank');
                         }}
                       >
                         <Download className="h-4 w-4 mr-2" /> 
                         Baixar Anexo: {n.arquivo_nome || 'Arquivo'}
                       </Button>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
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
