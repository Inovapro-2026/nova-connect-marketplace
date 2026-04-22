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
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  attachment_url?: string;
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
      const { data, error } = await (supabase
        .from('notifications' as any)
        .select('*')
        .eq('recipient_id' as any, user.id)
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      
      let filteredData = data || [];
      if (filter === 'unread') {
        filteredData = filteredData.filter((n: any) => !n.read);
      }
      setNotifications(filteredData);
    } catch (err) {
      console.error('Error loading notifications:', err);
      toast.error('Erro ao carregar notificações');
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
      const { error } = await (supabase.from('notifications' as any).update({ read: true }).eq('id', id) as any);
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await (supabase.from('notifications' as any).delete().eq('id', id) as any);
      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notificação removida');
    } catch (err) {
      toast.error('Erro ao excluir notificação');
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
              className={`surface-1 border-border/50 overflow-hidden rounded-2xl transition-all hover:shadow-xl hover:border-primary/30 group ${!n.read ? 'border-l-4 border-l-primary' : ''}`}
              onClick={() => !n.read && markAsRead(n.id)}
            >
              <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className="h-14 w-14 rounded-2xl shrink-0 flex items-center justify-center shadow-lg bg-primary text-white">
                  <Mail className="h-7 w-7" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <h3 className={`text-xl font-bold tracking-tight ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {n.title}
                      </h3>
                      {!n.read && <Badge variant="secondary" className="rounded-full bg-primary/20 text-primary border-0 font-bold uppercase text-[10px]">Novo</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                       {formatDate(n.created_at)}
                    </span>
                  </div>
                  
                  <p className={`text-base leading-relaxed ${!n.read ? 'text-muted-foreground font-medium' : 'text-muted-foreground/70'}`}>
                    {n.message}
                  </p>
                  
                  {n.attachment_url && (
                    <div className="pt-4 flex flex-wrap gap-3">
                       <Button 
                         variant="outline" 
                         className="rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold h-11"
                         onClick={(e) => {
                            e.stopPropagation();
                            window.open(n.attachment_url, '_blank');
                         }}
                       >
                         <Download className="h-4 w-4 mr-2" /> 
                         Baixar Anexo
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
