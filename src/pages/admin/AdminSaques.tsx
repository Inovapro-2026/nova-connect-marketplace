import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatBRL, formatDate } from '@/lib/format';
import { 
  Landmark, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  ExternalLink
} from 'lucide-react';

interface SaqueAdmin {
  id: string;
  vendedor_id: string;
  valor: number;
  valor_bruto?: number;
  taxa_valor?: number;
  valor_liquido?: number;
  status: 'pendente' | 'pago' | 'cancelado';
  chave_pix: string;
  tipo_pix: string;
  created_at: string;
  perfis_vendedor: {
    usuario_id: string;
    usuarios: {
      nome: string;
      sobrenome: string;
      email?: string;
    }
  }
}

export default function AdminSaques() {
  const [loading, setLoading] = useState(true);
  const [saques, setSaques] = useState<SaqueAdmin[]>([]);
  const [filtro, setFiltro] = useState<'pendente' | 'todos'>('pendente');

  useEffect(() => {
    fetchSaques();
  }, [filtro]);

  async function fetchSaques() {
    try {
      setLoading(true);
      let query = supabase
        .from('saques')
        .select(`
          *,
          perfis_vendedor (
            usuario_id,
            usuarios (
              nome,
              sobrenome
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (filtro === 'pendente') {
        query = query.eq('status', 'pendente');
      }

      const { data, error } = await query;
      if (error) throw error;
      setSaques(data as any[] || []);
    } catch (err: any) {
      toast.error('Erro ao carregar saques: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAprovar(id: string) {
    try {
      // Find the saque in the local state to get its value for logging
      const saque = saques.find(s => s.id === id);
      const valor = saque ? (saque.valor_bruto || saque.valor) : 0;
      
      console.log("Iniciando aprovação de saque...");
      console.log("ID do Saque:", id);
      console.log("Valor Bruto:", valor);

      const { error } = await (supabase.rpc as any)('aprovar_saque_vendedor', {
        p_saque_id: id
      });

      if (error) throw error;
      
      console.log("Saque aprovado com sucesso no banco!");
      toast.success('Saque marcado como pago!');
      
      // Refresh list to show updated status and potentially updated balances
      fetchSaques();
    } catch (err: any) {
      console.error("Erro ao aprovar saque:", err);
      toast.error('Erro ao aprovar saque: ' + err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Gerenciar Saques</h1>
          <p className="text-muted-foreground">Analise e processe as solicitações de retirada dos vendedores</p>
        </div>
        
        <div className="flex bg-muted p-1 rounded-lg">
          <button 
            onClick={() => setFiltro('pendente')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filtro === 'pendente' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Pendentes
          </button>
          <button 
            onClick={() => setFiltro('todos')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filtro === 'todos' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Todos
          </button>
        </div>
      </div>

      <Card className="surface-1 border-border/50 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : saques.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground italic">
            Nenhuma solicitação de saque encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Vendedor</th>
                  <th className="px-6 py-4">Data/Hora</th>
                  <th className="px-6 py-4">Valor Bruto</th>
                  <th className="px-6 py-4">Taxa (5%)</th>
                  <th className="px-6 py-4">Valor a Pagar</th>
                  <th className="px-6 py-4">PIX</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {saques.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">
                        {s.perfis_vendedor?.usuarios?.nome} {s.perfis_vendedor?.usuarios?.sobrenome}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(s.created_at)}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatBRL(s.valor_bruto || s.valor)}
                    </td>
                    <td className="px-6 py-4 text-destructive">
                      -{formatBRL(s.taxa_valor || 0)}
                    </td>
                    <td className="px-6 py-4 font-bold text-success">
                      {formatBRL(s.valor_liquido || (s.valor * 0.95))}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">{s.tipo_pix}</span>
                        <span className="font-mono text-[11px]">{s.chave_pix}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        s.status === 'pago' ? 'bg-success/10 text-success' :
                        s.status === 'pendente' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {s.status === 'pendente' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleAprovar(s.id)}
                          className="bg-success hover:bg-success/90 text-white border-0 h-8 text-xs"
                        >
                          Marcar como Pago
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex gap-3 text-primary text-xs">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <p>Ao marcar como <strong>Pago</strong>, certifique-se de que a transferência PIX foi realizada manualmente através do seu banco.</p>
      </div>
    </div>
  );
}
