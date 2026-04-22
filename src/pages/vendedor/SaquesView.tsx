import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight,
  Banknote,
  History,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatBRL, formatDate } from '@/lib/format';

import { Badge } from '@/components/ui/badge';

interface Saque {
  id: string;
  valor: number;
  valor_bruto?: number;
  taxa_valor?: number;
  valor_liquido?: number;
  status: 'pendente' | 'pago' | 'cancelado';
  chave_pix: string;
  tipo_pix: string;
  created_at: string;
}

export default function SaquesView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saques, setSaques] = useState<Saque[]>([]);
  const [stats, setStats] = useState({ disponivel: 0, pendente: 0, processando: 0 });
  const [valorSaque, setValorSaque] = useState('');
  const [pixInfo, setPixInfo] = useState({ tipo: '', chave: '' });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    try {
      setLoading(true);
      
      const { data: u } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', user!.id)
        .maybeSingle();
      
      if (!u) return;

      const { data: pv } = await supabase
        .from('perfis_vendedor')
        .select('id, saldo_disponivel, saldo_pendente, pix_tipo, pix_chave')
        .eq('usuario_id', u.id)
        .maybeSingle();

      if (pv) {
        // Get withdrawals to calculate "em processamento"
        const { data: list } = await supabase
          .from('saques')
          .select('*')
          .eq('vendedor_id', pv.id)
          .order('created_at', { ascending: false });

        const history = (list as Saque[]) || [];
        const processando = history
          .filter(s => s.status === 'pendente')
          .reduce((acc, s) => acc + (s.valor_bruto || s.valor), 0);

        setStats({
          disponivel: Number(pv.saldo_disponivel || 0),
          pendente: Number(pv.saldo_pendente || 0),
          processando
        });
        setPixInfo({
          tipo: pv.pix_tipo || '',
          chave: pv.pix_chave || ''
        });
        setSaques(history);
      }
    } catch (err) {
      console.error('Erro ao carregar dados de saque:', err);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  }

  // Live calculation
  const valorInput = Number(valorSaque) || 0;
  const taxaCalculada = valorInput * 0.05;
  const liquidoCalculado = Math.max(0, valorInput - taxaCalculada);

  async function handleRequestSaque(e: React.FormEvent) {
    e.preventDefault();
    const valor = Number(valorSaque);

    if (valor <= 0) {
      toast.error('Informe um valor válido para saque');
      return;
    }

    if (valor > stats.disponivel) {
      toast.error('Saldo insuficiente');
      return;
    }

    if (!pixInfo.chave) {
      toast.error('Configure sua chave PIX nas configurações da conta');
      return;
    }

    try {
      setSubmitting(true);
      
      const { data: u } = await supabase.from('usuarios').select('id').eq('auth_user_id', user!.id).single();
      const { data: pv } = await supabase.from('perfis_vendedor').select('id').eq('usuario_id', u.id).single();

      const { error } = await supabase.rpc('solicitar_saque_vendedor', {
        p_vendedor_id: pv.id,
        p_valor: valor,
        p_valor_bruto: valor,
        p_taxa_valor: taxaCalculada,
        p_valor_liquido: liquidoCalculado,
        p_chave_pix: pixInfo.chave,
        p_tipo_pix: pixInfo.tipo
      });

      if (error) throw error;

      toast.success(`Saque solicitado! Valor líquido: ${formatBRL(liquidoCalculado)}`);
      setValorSaque('');
      fetchData();
    } catch (err: any) {
      toast.error('Erro ao solicitar saque: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Financeiro & Saques</h1>
        <p className="text-muted-foreground">Gerencie seus recebíveis e solicitações de retirada</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card de Solicitação */}
        <Card className="surface-1 border-border/50 p-6 space-y-6">
          <div className="flex items-center gap-3 text-primary">
            <Banknote className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Solicitar Retirada</h2>
          </div>

          <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
            <div className="text-sm text-muted-foreground mb-1">Disponível para Saque</div>
            <div className="text-3xl font-bold text-primary">{formatBRL(stats.disponivel)}</div>
          </div>

          <form onSubmit={handleRequestSaque} className="space-y-4">
            <div className="space-y-2">
              <Label>Quanto deseja retirar?</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0.01"
                  className="pl-9 h-12 text-lg font-bold"
                  placeholder="0,00"
                  value={valorSaque}
                  onChange={(e) => setValorSaque(e.target.value)}
                  disabled={submitting || stats.disponivel <= 0}
                />
              </div>
            </div>

            {valorInput > 0 && (
              <div className="p-4 bg-muted/30 rounded-xl border border-border/50 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Solicitado:</span>
                  <span className="font-medium text-foreground">{formatBRL(valorInput)}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>Taxa Administrativa (5%):</span>
                  <span>-{formatBRL(taxaCalculada)}</span>
                </div>
                <div className="pt-2 border-t border-border/50 flex justify-between text-lg font-bold">
                  <span className="text-foreground">Você vai receber:</span>
                  <span className="text-success">{formatBRL(liquidoCalculado)}</span>
                </div>
              </div>
            )}

            {pixInfo.chave ? (
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50 space-y-1">
                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Destino PIX</div>
                <div className="text-sm font-medium">{pixInfo.chave}</div>
                <div className="text-[10px] text-muted-foreground capitalize">{pixInfo.tipo}</div>
              </div>
            ) : (
              <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl flex gap-3 text-warning">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-xs">Você ainda não configurou uma chave PIX. Vá em <strong>Minha Conta</strong> para configurar.</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 gradient-primary border-0 text-white font-bold" 
              disabled={submitting || !pixInfo.chave || stats.disponivel <= 0 || valorInput <= 0 || valorInput > stats.disponivel}
            >
              {submitting ? 'Processando...' : 'Confirmar e Solicitar Saque'}
            </Button>
          </form>
        </Card>

        {/* Resumo e Regras */}
        <div className="space-y-6">
          <Card className="surface-1 border-border/50 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              Resumo Financeiro
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-warning/5 border border-warning/10">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Saldo Pendente</span>
                  <span className="text-sm text-muted-foreground">Vendas em período de carência</span>
                </div>
                <span className="text-xl font-bold text-warning">{formatBRL(stats.pendente)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex flex-col">
                  <span className="text-xs text-primary uppercase font-bold tracking-tight">Em Processamento</span>
                  <span className="text-sm text-muted-foreground">Saques solicitados aguardando pagamento</span>
                </div>
                <span className="text-xl font-bold text-primary">{formatBRL(stats.processando)}</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-success/5 border border-success/10">
                <div className="flex flex-col">
                  <span className="text-xs text-success uppercase font-bold tracking-tight">Disponível Agora</span>
                  <span className="text-sm text-muted-foreground">Valor livre para saque imediato</span>
                </div>
                <span className="text-xl font-bold text-success">{formatBRL(stats.disponivel)}</span>
              </div>
            </div>
          </Card>

          <Card className="surface-1 border-border/50 p-6 space-y-4">
            <div className="flex items-center gap-3 text-accent">
              <Info className="h-6 w-6" />
              <h2 className="text-lg font-semibold">Regras & Prazos</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <p>Processamento em até <strong>48 horas úteis</strong>.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <p>Pagamentos realizados exclusivamente via <strong>PIX</strong>.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <p>Taxa de <strong>5%</strong> aplicada sobre cada saque para cobrir custos de operação.</p>
              </div>
              <div className="flex gap-3">
                <AlertCircle className="h-4 w-4 text-warning shrink-0" />
                <p>O valor exibido como "Receber" já considera o desconto da taxa.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Histórico */}
      <Card className="surface-1 border-border/50 p-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Histórico de Saques</h3>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase font-bold">{saques.length} registros</Badge>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded-lg" />)}
          </div>
        ) : saques.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground italic bg-muted/10 rounded-xl border border-dashed border-border">
            Nenhuma solicitação de saque encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider border-b border-border/50">
                <tr>
                  <th className="px-4 py-4">Data</th>
                  <th className="px-4 py-4">Solicitado (Bruto)</th>
                  <th className="px-4 py-4">Taxa (5%)</th>
                  <th className="px-4 py-4">Recebido (Líquido)</th>
                  <th className="px-4 py-4">PIX</th>
                  <th className="px-4 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {saques.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-4 text-muted-foreground">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-4 font-semibold text-foreground">{formatBRL(s.valor_bruto || s.valor)}</td>
                    <td className="px-4 py-4 text-destructive">-{formatBRL(s.taxa_valor || (s.valor * 0.05))}</td>
                    <td className="px-4 py-4 font-bold text-success">{formatBRL(s.valor_liquido || (s.valor * 0.95))}</td>
                    <td className="px-4 py-4 font-mono text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">{s.chave_pix}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        s.status === 'pago' ? 'bg-success/10 text-success' :
                        s.status === 'pendente' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {s.status === 'pago' ? 'Pago' : s.status === 'pendente' ? 'Em Processamento' : 'Cancelado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
