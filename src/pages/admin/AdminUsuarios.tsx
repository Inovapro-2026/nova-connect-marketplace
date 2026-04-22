import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, User as UserIcon, MoreHorizontal, 
  ShieldAlert, Lock, Unlock, Mail, Bell, 
  ShoppingBag, MessageSquare, History, Pencil,
  CheckCircle2, AlertCircle, Trash2, Key,
  ExternalLink, Download, Upload, Loader2, DollarSign
} from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Sheet, SheetContent,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { formatDate, formatBRL } from '@/lib/format';
import { useAuth } from '@/contexts/AuthContext';

interface Usuario {
  id: string;
  auth_user_id: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string | null;
  cpf_cnpj: string | null;
  tipo_conta: string | null;
  status: 'ativo' | 'bloqueado' | 'suspenso';
  created_at: string | null;
  bloqueado_em: string | null;
  motivo_bloqueio: string | null;
  ultimo_login: string | null;
  perfis_vendedor?: {
    saldo_disponivel: number;
    saldo_pendente: number;
    saldo_sacado: number;
    total_vendas: number;
  } | null;
}

export default function AdminUsuarios() {
  const { user: adminUser } = useAuth();
  const [list, setList] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState({ total: 0, ativos: 0, bloqueados: 0 });

  const load = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('usuarios')
        .select('*, perfis_vendedor(saldo_disponivel, saldo_pendente, saldo_sacado, total_vendas)')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`nome.ilike.%${search}%,sobrenome.ilike.%${search}%,email.ilike.%${search}%`);
      }
      if (roleFilter !== 'todos') {
        query = query.eq('tipo_conta', roleFilter);
      }
      if (statusFilter !== 'todos') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      setList((data as Usuario[]) ?? []);

      // Total stats
      const { data: totalData } = await supabase.from('usuarios').select('status');
      if (totalData) {
        setStats({
          total: totalData.length,
          ativos: totalData.filter(u => u.status === 'ativo').length,
          bloqueados: totalData.filter(u => u.status === 'bloqueado').length
        });
      }
    } catch (err: any) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Gestão de Usuários — Admin';
    load();
  }, [search, roleFilter, statusFilter]);

  const handleAction = async (userId: string, action: string, details: any = {}) => {
    try {
      // 1. Registrar Log
      await supabase.rpc('log_admin_action', {
        p_admin_auth_id: adminUser?.id,
        p_target_usuario_id: userId,
        p_acao: action,
        p_detalhes: details
      });

      // 2. Executar Ação
      if (action === 'bloqueio') {
        await supabase.from('usuarios').update({ 
          status: 'bloqueado', 
          bloqueado_em: new Date().toISOString(),
          motivo_bloqueio: details.motivo || 'Violação dos termos'
        }).eq('id', userId);
        toast.warning('Usuário bloqueado');
      } else if (action === 'desbloqueio') {
        await supabase.from('usuarios').update({ 
          status: 'ativo', 
          bloqueado_em: null,
          motivo_bloqueio: null 
        }).eq('id', userId);
        toast.success('Usuário desbloqueado');
      }

      load();
    } catch (err: any) {
      toast.error('Erro ao executar ação');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight">Gestão de Usuários</h1>
          <p className="text-muted-foreground text-lg">Central administrativa para controle total de contas</p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="px-4 py-2 surface-1 border-border/50 flex flex-col items-center">
            <span className="text-2xl font-black">{stats.total}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total</span>
          </Card>
          <Card className="px-4 py-2 surface-1 border-border/50 flex flex-col items-center">
            <span className="text-2xl font-black text-success">{stats.ativos}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Ativos</span>
          </Card>
          <Card className="px-4 py-2 surface-1 border-border/50 flex flex-col items-center">
            <span className="text-2xl font-black text-destructive">{stats.bloqueados}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Bloqueados</span>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome, email ou sobrenome..." 
            className="pl-10 h-12 rounded-xl surface-1 border-border/50 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="h-12 w-full rounded-xl surface-1 border-border/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="todos">Todos os Papéis</option>
            <option value="cliente">Clientes</option>
            <option value="vendedor">Vendedores</option>
            <option value="admin">Administradores</option>
          </select>
        </div>
        <div className="flex gap-2">
          <select 
            className="h-12 w-full rounded-xl surface-1 border-border/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativos</option>
            <option value="bloqueado">Bloqueados</option>
            <option value="suspenso">Suspensos</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <Card className="surface-1 border-border/50 p-20 text-center rounded-3xl">
          <div className="h-20 w-20 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="font-display text-2xl font-bold mb-2">Nenhum usuário encontrado</h3>
          <p className="text-muted-foreground">Tente ajustar seus filtros de busca.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((u) => (
            <Card 
              key={u.id} 
              className={`surface-1 border-border/50 p-4 rounded-2xl transition-all hover:shadow-lg hover:border-primary/30 group cursor-pointer ${u.status === 'bloqueado' ? 'opacity-70 bg-destructive/5' : ''}`}
              onClick={() => { setSelectedUser(u); setIsDrawerOpen(true); }}
            >
              <div className="flex items-center gap-4">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl text-white font-black shadow-lg ${
                  u.tipo_conta === 'admin' ? 'bg-indigo-600' : 
                  u.tipo_conta === 'vendedor' ? 'bg-amber-500' : 'bg-blue-500'
                }`}>
                  {u.nome[0]?.toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg truncate">{u.nome} {u.sobrenome}</h3>
                    {u.status === 'bloqueado' && (
                      <Badge variant="destructive" className="animate-pulse">Bloqueado</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {u.email}</span>
                    <span className="flex items-center gap-1 uppercase tracking-tighter font-bold text-[10px] bg-surface-2 px-2 py-0.5 rounded-md border border-border/30">
                       {u.tipo_conta}
                    </span>
                    <span className="hidden md:flex items-center gap-1"><History className="h-3 w-3" /> Criado em {formatDate(u.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block mr-4">
                    <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                      {u.tipo_conta === 'vendedor' || u.tipo_conta === 'freelas' ? 'Faturamento' : 'Saldo'}
                    </div>
                    <div className="font-black text-lg">
                      {formatBRL(
                        u.perfis_vendedor 
                          ? Number(u.perfis_vendedor.saldo_disponivel || 0) + 
                            Number(u.perfis_vendedor.saldo_pendente || 0) + 
                            Number(u.perfis_vendedor.saldo_sacado || 0)
                          : 0
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-surface-2">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-2xl border-border/50">
                      <DropdownMenuLabel>Ações Rápidas</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { setSelectedUser(u); setIsDrawerOpen(true); }}>
                        <Pencil className="h-4 w-4 mr-2" /> Editar Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction(u.id, u.status === 'bloqueado' ? 'desbloqueio' : 'bloqueio')}>
                        {u.status === 'bloqueado' ? <Unlock className="h-4 w-4 mr-2 text-success" /> : <Lock className="h-4 w-4 mr-2 text-destructive" />}
                        {u.status === 'bloqueado' ? 'Desbloquear Conta' : 'Bloquear Conta'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Excluir Registro
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* User Detail Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="sm:max-w-4xl w-full p-0 flex flex-col surface-1 border-l-border/50 overflow-hidden">
          {selectedUser && (
            <div className="h-full flex flex-col overflow-hidden">
              <div className="p-8 pb-4 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-6">
                    <div className={`h-24 w-24 rounded-3xl flex items-center justify-center text-4xl text-white font-black shadow-2xl ${
                      selectedUser.tipo_conta === 'admin' ? 'bg-indigo-600' : 
                      selectedUser.tipo_conta === 'vendedor' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}>
                      {selectedUser.nome[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">{selectedUser.nome} {selectedUser.sobrenome}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant={selectedUser.status === 'ativo' ? 'default' : 'destructive'} className="rounded-full px-3">
                          {selectedUser.status.toUpperCase()}
                        </Badge>
                        <span className="text-muted-foreground font-medium">{selectedUser.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl h-12 w-12" title="Resetar Senha">
                      <Key className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant={selectedUser.status === 'bloqueado' ? 'default' : 'destructive'} 
                      size="icon" 
                      className="rounded-xl h-12 w-12"
                      onClick={() => handleAction(selectedUser.id, selectedUser.status === 'bloqueado' ? 'desbloqueio' : 'bloqueio')}
                    >
                      {selectedUser.status === 'bloqueado' ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="resumo" className="w-full">
                  <TabsList className="bg-surface-2 p-1 rounded-2xl w-full justify-start overflow-x-auto h-auto">
                    <TabsTrigger value="resumo" className="rounded-xl px-6 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Resumo</TabsTrigger>
                    <TabsTrigger value="conta" className="rounded-xl px-6 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Conta & Perfil</TabsTrigger>
                    <TabsTrigger value="financeiro" className="rounded-xl px-6 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Financeiro</TabsTrigger>
                    <TabsTrigger value="pedidos" className="rounded-xl px-6 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Pedidos</TabsTrigger>
                    <TabsTrigger value="conversas" className="rounded-xl px-6 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Conversas</TabsTrigger>
                    <TabsTrigger value="avisos" className="rounded-xl px-6 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Avisos</TabsTrigger>
                    <TabsTrigger value="historico" className="rounded-xl px-6 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Log Admin</TabsTrigger>
                  </TabsList>

                  <div className="mt-8 pb-10 overflow-y-auto h-[calc(100vh-320px)] pr-2 scrollbar-thin">
                    <TabsContent value="resumo" className="mt-0">
                      <UserResumoTab user={selectedUser} />
                    </TabsContent>
                    
                    <TabsContent value="conta" className="mt-0">
                      <UserContaTab user={selectedUser} onUpdate={load} />
                    </TabsContent>

                    <TabsContent value="financeiro" className="mt-0">
                      <UserFinanceiroTab user={selectedUser} />
                    </TabsContent>

                    <TabsContent value="pedidos" className="mt-0">
                      <UserPedidosTab user={selectedUser} />
                    </TabsContent>

                    <TabsContent value="conversas" className="mt-0">
                      <UserConversasTab user={selectedUser} />
                    </TabsContent>

                    <TabsContent value="avisos" className="mt-0">
                      <UserAvisosTab user={selectedUser} adminAuthId={adminUser?.id || ''} />
                    </TabsContent>

                    <TabsContent value="historico" className="mt-0">
                      <UserHistoryTab user={selectedUser} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// --- TAB COMPONENTS ---

function UserResumoTab({ user }: { user: Usuario }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6 surface-2 border-border/30 rounded-3xl">
        <h4 className="font-bold text-lg mb-4 flex items-center gap-2"><UserIcon className="h-5 w-5 text-primary" /> Informações Básicas</h4>
        <div className="space-y-4">
          <div className="flex justify-between border-b border-border/30 pb-2">
            <span className="text-muted-foreground">Nome Completo</span>
            <span className="font-bold">{user.nome} {user.sobrenome}</span>
          </div>
          <div className="flex justify-between border-b border-border/30 pb-2">
            <span className="text-muted-foreground">E-mail</span>
            <span className="font-bold">{user.email}</span>
          </div>
          <div className="flex justify-between border-b border-border/30 pb-2">
            <span className="text-muted-foreground">CPF/CNPJ</span>
            <span className="font-bold">{user.cpf_cnpj || '—'}</span>
          </div>
          <div className="flex justify-between border-b border-border/30 pb-2">
            <span className="text-muted-foreground">Telefone</span>
            <span className="font-bold">{user.telefone || '—'}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 surface-2 border-border/30 rounded-3xl">
        <h4 className="font-bold text-lg mb-4 flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-primary" /> Atividade da Conta</h4>
        <div className="space-y-4">
          <div className="flex justify-between border-b border-border/30 pb-2">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={user.status === 'ativo' ? 'default' : 'destructive'}>{user.status.toUpperCase()}</Badge>
          </div>
          <div className="flex justify-between border-b border-border/30 pb-2">
            <span className="text-muted-foreground">Cadastro</span>
            <span className="font-bold">{formatDate(user.created_at)}</span>
          </div>
          <div className="flex justify-between border-b border-border/30 pb-2">
            <span className="text-muted-foreground">Último Login</span>
            <span className="font-bold">{formatDate(user.ultimo_login)}</span>
          </div>
          <div className="flex justify-between border-b border-border/30 pb-2">
            <span className="text-muted-foreground">Papel</span>
            <span className="font-black uppercase text-xs tracking-widest">{user.tipo_conta}</span>
          </div>
        </div>
      </Card>

      {user.status === 'bloqueado' && (
        <Card className="p-6 bg-destructive/10 border-destructive/20 rounded-3xl md:col-span-2">
          <h4 className="font-bold text-destructive flex items-center gap-2 mb-2"><AlertCircle className="h-5 w-5" /> Detalhes do Bloqueio</h4>
          <p className="text-sm">Conta bloqueada em <strong>{formatDate(user.bloqueado_em)}</strong>.</p>
          <p className="text-sm mt-1 italic">Motivo: {user.motivo_bloqueio}</p>
        </Card>
      )}
    </div>
  );
}

function UserContaTab({ user, onUpdate }: { user: Usuario, onUpdate: () => void }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [saving, setSaving] = useState(false);
  const [newPass, setNewPass] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('usuarios').update({
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        telefone: formData.telefone,
        cpf_cnpj: formData.cpf_cnpj,
        tipo_conta: formData.tipo_conta,
        status: formData.status
      }).eq('id', user.id);
      
      if (error) throw error;
      
      await supabase.rpc('log_admin_action', {
        p_admin_auth_id: (await supabase.auth.getUser()).data.user?.id,
        p_target_usuario_id: user.id,
        p_acao: 'edicao_perfil',
        p_detalhes: { campos_alterados: true }
      });

      toast.success('Perfil atualizado com sucesso');
      setEditing(false);
      onUpdate();
    } catch (err) {
      toast.error('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPass.length < 6) return toast.error('A senha deve ter pelo menos 6 caracteres');
    try {
      const { error } = await supabase.rpc('admin_change_user_password', {
        target_auth_id: user.auth_user_id,
        new_password: newPass
      });
      if (error) throw error;

      await supabase.rpc('log_admin_action', {
        p_admin_auth_id: (await supabase.auth.getUser()).data.user?.id,
        p_target_usuario_id: user.id,
        p_acao: 'alteracao_senha',
        p_detalhes: { metodo: 'admin_direct' }
      });

      toast.success('Senha alterada com sucesso');
      setNewPass('');
    } catch (err) {
      toast.error('Erro ao alterar senha. Verifique se a função admin está habilitada.');
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-8 surface-2 border-border/30 rounded-3xl">
        <div className="flex items-center justify-between mb-8">
          <h4 className="font-black text-xl flex items-center gap-2"><Pencil className="h-6 w-6 text-primary" /> Editar Cadastro</h4>
          <Button variant={editing ? "ghost" : "default"} onClick={() => setEditing(!editing)} className="rounded-xl">
             {editing ? 'Cancelar' : 'Editar Dados'}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input disabled={!editing} value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="rounded-xl h-12" />
          </div>
          <div className="space-y-2">
            <Label>Sobrenome</Label>
            <Input disabled={!editing} value={formData.sobrenome} onChange={e => setFormData({...formData, sobrenome: e.target.value})} className="rounded-xl h-12" />
          </div>
          <div className="space-y-2">
            <Label>E-mail (Apenas Leitura)</Label>
            <Input disabled value={formData.email} className="rounded-xl h-12 bg-surface-1" />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input disabled={!editing} value={formData.telefone || ''} onChange={e => setFormData({...formData, telefone: e.target.value})} className="rounded-xl h-12" />
          </div>
          <div className="space-y-2">
            <Label>CPF/CNPJ</Label>
            <Input disabled={!editing} value={formData.cpf_cnpj || ''} onChange={e => setFormData({...formData, cpf_cnpj: e.target.value})} className="rounded-xl h-12" />
          </div>
          <div className="space-y-2">
            <Label>Papel da Conta</Label>
            <select 
              disabled={!editing} 
              value={formData.tipo_conta || 'cliente'} 
              onChange={e => setFormData({...formData, tipo_conta: e.target.value})}
              className="h-12 w-full rounded-xl surface-1 border border-border/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              <option value="cliente">Cliente</option>
              <option value="vendedor">Vendedor / Freela</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        {editing && (
          <div className="mt-8 flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gradient-primary border-0 text-white px-10 h-12 rounded-xl font-bold shadow-lg shadow-primary/20">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Salvar Alterações'}
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-8 surface-2 border-border/30 rounded-3xl">
        <h4 className="font-black text-xl flex items-center gap-2 mb-8"><Key className="h-6 w-6 text-primary" /> Segurança</h4>
        <div className="max-w-md space-y-6">
          <div className="space-y-2">
            <Label>Definir Nova Senha</Label>
            <div className="flex gap-2">
              <Input 
                type="password" 
                placeholder="Mínimo 6 caracteres" 
                className="rounded-xl h-12" 
                value={newPass} 
                onChange={e => setNewPass(e.target.value)}
              />
              <Button onClick={handleChangePassword} className="h-12 px-6 rounded-xl font-bold">Alterar</Button>
            </div>
            <p className="text-[10px] text-muted-foreground">A senha será atualizada instantaneamente no banco de autenticação.</p>
          </div>
          
          <div className="pt-4 border-t border-border/30">
            <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-dashed border-2 hover:bg-primary/5 hover:border-primary/50 group">
              <Mail className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" /> Enviar E-mail de Redefinição
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function UserFinanceiroTab({ user }: { user: Usuario }) {
  const vStats = user.perfis_vendedor;
  const faturamento = vStats 
    ? Number(vStats.saldo_disponivel || 0) + Number(vStats.saldo_pendente || 0) + Number(vStats.saldo_sacado || 0)
    : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 surface-2 border-border/30 rounded-3xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Saldo Disponível</span>
          <span className="text-3xl font-black">{formatBRL(vStats?.saldo_disponivel || 0)}</span>
        </Card>
        <Card className="p-6 surface-2 border-border/30 rounded-3xl flex flex-col items-center justify-center text-center border-b-primary/30">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Faturamento Bruto</span>
          <span className="text-3xl font-black text-primary">{formatBRL(faturamento)}</span>
        </Card>
        <Card className="p-6 surface-2 border-border/30 rounded-3xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Vendas Realizadas</span>
          <span className="text-3xl font-black">{vStats?.total_vendas || 0}</span>
        </Card>
      </div>

      {(user.tipo_conta === 'vendedor' || user.tipo_conta === 'freelas' || user.tipo_conta === 'vendas') && (
        <Card className="p-8 surface-2 border-border/30 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <DollarSign className="h-24 w-24" />
          </div>
          <h4 className="font-black text-xl mb-6">Detalhamento Vendedor</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border/30 pb-3">
                <span className="text-muted-foreground font-medium">Saldo Pendente</span>
                <span className="font-bold text-amber-500">{formatBRL(vStats?.saldo_pendente || 0)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/30 pb-3">
                <span className="text-muted-foreground font-medium">Total já Sacado</span>
                <span className="font-bold text-success">{formatBRL(vStats?.saldo_sacado || 0)}</span>
              </div>
            </div>
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <p className="text-sm text-muted-foreground mb-4">
                O faturamento bruto considera todos os valores que passaram pela conta (Disponível + Pendente + Sacado).
              </p>
              <Button variant="outline" className="w-full rounded-xl font-bold" onClick={() => window.open(`/admin/financeiro?vendedor=${user.id}`, '_blank')}>
                Ver Todas as Transações <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <h4 className="font-black text-xl">Histórico Recente</h4>
        <div className="p-12 text-center text-muted-foreground italic surface-2 border border-dashed border-border/50 rounded-3xl">
          Funcionalidade de extrato detalhado em desenvolvimento...
        </div>
      </div>
    </div>
  );
}

function UserPedidosTab({ user }: { user: Usuario }) {
  return (
    <Card className="p-8 surface-2 border-border/30 rounded-3xl">
      <h4 className="font-black text-xl mb-6 flex items-center gap-2"><ShoppingBag className="h-6 w-6" /> Pedidos Recentes</h4>
      <div className="space-y-4">
        {/* Placeholder list */}
        <div className="text-center py-20">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">O usuário ainda não possui histórico de pedidos.</p>
        </div>
      </div>
    </Card>
  );
}

function UserConversasTab({ user }: { user: Usuario }) {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('chats')
      .select('*, customer:customer_id(nome, email), seller:seller_id(nome, email)')
      .or(`customer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setChats(data || []);
        setLoading(false);
      });
  }, [user.id]);

  return (
    <Card className="p-8 surface-2 border-border/30 rounded-3xl">
      <h4 className="font-black text-xl mb-6 flex items-center gap-2"><MessageSquare className="h-6 w-6" /> Histórico de Atendimento</h4>
      
      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : chats.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma conversa encontrada.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {chats.map(chat => (
            <div key={chat.id} className="py-4 flex items-center justify-between group">
              <div>
                <div className="font-bold">Conversa ID: {chat.id.slice(0, 8)}</div>
                <div className="text-sm text-muted-foreground">
                  {chat.customer_id === user.id ? `Vendedor: ${chat.seller?.nome}` : `Cliente: ${chat.customer?.nome}`}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="rounded-lg">
                 Auditar <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function UserAvisosTab({ user, adminAuthId }: { user: Usuario, adminAuthId: string }) {
  const [msg, setMsg] = useState('');
  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = async () => {
    try {
      const { data } = await ((supabase as any).from('notifications')
        .select('*')
        .eq('recipient_id', user.auth_user_id)
        .order('created_at', { ascending: false }));
      
      setHistory(data || []);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  useEffect(() => { loadHistory(); }, [user.auth_user_id]);

  const sendNotification = async () => {
    if (!title || !msg) return toast.error('Preencha o título e a mensagem');
    setSending(true);
    try {
      const { error } = await (supabase.from('notifications' as any).insert({
        recipient_id: user.auth_user_id,
        title: title,
        message: msg,
        attachment_url: fileUrl || null
      } as any) as any);

      if (error) throw error;

      // 2. Log admin action
      await supabase.rpc('log_admin_action' as any, {
        p_admin_auth_id: adminAuthId,
        p_target_usuario_id: user.id,
        p_acao: 'envio_aviso',
        p_detalhes: { titulo: title }
      });

      toast.success('Aviso enviado com sucesso!');
      setTitle('');
      setMsg('');
      setFileUrl('');
      loadHistory();
    } catch (err) {
      toast.error('Erro ao enviar aviso');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-8 surface-2 border-border/30 rounded-3xl">
        <h4 className="font-black text-xl mb-6 flex items-center gap-2"><Bell className="h-6 w-6 text-primary" /> Novo Aviso / Notificação</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Título do Aviso</Label>
            <Input placeholder="Ex: Importante: Atualização cadastral" className="rounded-xl h-12" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Mensagem</Label>
            <textarea 
              className="w-full min-h-[120px] rounded-xl surface-1 border border-border/50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Escreva a mensagem detalhada..."
              value={msg}
              onChange={e => setMsg(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Link do Anexo (Opcional)</Label>
            <div className="flex gap-2">
              <Input placeholder="URL do arquivo (Gdrive, etc)" className="rounded-xl h-12" value={fileUrl} onChange={e => setFileUrl(e.target.value)} />
              <Button variant="outline" className="h-12 px-4 rounded-xl"><Upload className="h-4 w-4" /></Button>
            </div>
          </div>
          <Button onClick={sendNotification} disabled={sending} className="w-full h-12 rounded-xl font-bold gradient-primary border-0 text-white shadow-lg shadow-primary/20">
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enviar Notificação Agora'}
          </Button>
        </div>
      </Card>

      <Card className="p-8 surface-2 border-border/30 rounded-3xl">
        <h4 className="font-black text-lg mb-6">Histórico de Avisos Enviados</h4>
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">Nenhum aviso enviado anteriormente.</p>
          ) : (
            history.map(h => (
              <div key={h.id} className="p-4 bg-surface-1 border border-border/30 rounded-2xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-sm">{h.titulo}</span>
                  <span className="text-[10px] text-muted-foreground">{formatDate(h.created_at)}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{h.mensagem}</p>
                {h.arquivo_url && (
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-primary font-bold">
                    <Download className="h-3 w-3" /> Anexo incluído
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function UserHistoryTab({ user }: { user: Usuario }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('logs_administrativos')
      .select('*, admin:admin_id(nome, sobrenome)')
      .eq('alvo_usuario_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setLogs(data || []);
        setLoading(false);
      });
  }, [user.id]);

  return (
    <Card className="p-8 surface-2 border-border/30 rounded-3xl">
      <h4 className="font-black text-xl mb-6 flex items-center gap-2"><History className="h-6 w-6" /> Auditoria da Conta</h4>
      
      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : logs.length === 0 ? (
        <div className="text-center py-20">
          <History className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma ação administrativa registrada.</p>
        </div>
      ) : (
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/50 before:to-transparent">
          {logs.map(log => (
            <div key={log.id} className="relative flex items-center justify-between md:justify-start md:space-x-4 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border/50 bg-surface-2 group-hover:scale-110 transition-transform z-10">
                 {log.acao === 'bloqueio' ? <Lock className="h-4 w-4 text-destructive" /> : 
                  log.acao === 'desbloqueio' ? <Unlock className="h-4 w-4 text-success" /> :
                  log.acao === 'envio_aviso' ? <Bell className="h-4 w-4 text-primary" /> :
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="flex-1 bg-surface-1 p-4 rounded-2xl border border-border/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm uppercase tracking-widest">{log.acao}</span>
                  <span className="text-[10px] text-muted-foreground">{formatDate(log.created_at)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Admin: {log.admin?.nome} {log.admin?.sobrenome}
                </div>
                {log.detalhes && (
                  <pre className="mt-2 text-[10px] bg-black/5 p-2 rounded-lg overflow-x-auto text-muted-foreground">
                    {JSON.stringify(log.detalhes, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
