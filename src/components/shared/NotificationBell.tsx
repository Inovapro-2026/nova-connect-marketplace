import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bell, Check, ExternalLink, Mail, 
  Trash2, Download, AlertCircle, Info
} from 'lucide-react';
import { 
  Popover, PopoverContent, PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  attachment_url?: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.read).length);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Realtime subscription
    const channel = supabase
      .channel('notifications_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        loadNotifications();
        toast.info('Você tem uma nova notificação!');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('Todas as notificações lidas');
    } catch (err) {
      toast.error('Erro ao marcar todas como lidas');
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-surface-2 transition-all group">
          <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-4 w-4 bg-destructive text-[10px] text-white font-bold flex items-center justify-center rounded-full animate-bounce">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0 rounded-2xl shadow-2xl border-border/50 surface-1 overflow-hidden" align="end">
        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-surface-2/50">
          <h4 className="font-bold">Notificações</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-[10px] uppercase font-bold tracking-widest text-primary hover:bg-primary/10">
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
          {loading && notifications.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground italic">Carregando...</div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="h-12 w-12 bg-surface-2 rounded-full flex items-center justify-center mx-auto">
                <Bell className="h-6 w-6 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhuma notificação encontrada.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 transition-all hover:bg-surface-2/50 cursor-pointer relative group ${!n.read ? 'bg-primary/5' : ''}`}
                  onClick={() => {
                    markAsRead(n.id);
                    // Lógica para abrir detalhes ou navegar
                  }}
                >
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-xl shrink-0 flex items-center justify-center bg-primary/10 text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm truncate pr-2">{n.title}</span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDate(n.created_at)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{n.message}</p>
                      
                      {n.attachment_url && (
                        <div className="flex items-center gap-2">
                           <Button 
                             variant="outline" 
                             size="sm" 
                             className="h-7 text-[10px] rounded-lg border-primary/20 hover:border-primary text-primary bg-primary/5"
                             onClick={(e) => {
                               e.stopPropagation();
                               window.open(n.attachment_url, '_blank');
                             }}
                           >
                             <Download className="h-3 w-3 mr-1" /> Baixar Anexo
                           </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {!n.read && (
                    <div className="absolute right-4 bottom-4 h-2 w-2 bg-primary rounded-full" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-3 border-t border-border/50 bg-surface-2/50 text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
            onClick={() => nav('/app/avisos')}
          >
            Ver todos os avisos <ExternalLink className="h-3 w-3 ml-2" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
