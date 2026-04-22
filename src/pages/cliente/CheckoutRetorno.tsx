import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';
import { PublicHeader, PublicFooter } from '@/components/PublicShell';

type Status = 'success' | 'pending' | 'failure';

export default function CheckoutRetorno() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<Status>('pending');

  useEffect(() => {
    document.title = 'Status do pagamento — InovaPro Shop';
    const s = (params.get('status') as Status) || 'pending';
    setStatus(s);
  }, [params]);

  const cfg = {
    success: { icon: CheckCircle2, color: 'text-success', title: 'Pagamento aprovado!', desc: 'Seu pedido foi confirmado. Você pode acompanhar tudo em "Meus Pedidos".' },
    pending: { icon: Clock, color: 'text-warning', title: 'Pagamento em análise', desc: 'Estamos aguardando a confirmação. Você receberá uma notificação assim que for aprovado.' },
    failure: { icon: XCircle, color: 'text-destructive', title: 'Pagamento não aprovado', desc: 'Houve um problema com o pagamento. Tente novamente ou use outro método.' },
  }[status];

  const Icon = cfg.icon;

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 container py-20 flex items-center justify-center">
        <Card className="surface-1 border-border/50 p-10 max-w-lg w-full text-center">
          <Icon className={`h-16 w-16 mx-auto mb-4 ${cfg.color}`} />
          <h1 className="font-display text-2xl font-bold mb-2">{cfg.title}</h1>
          <p className="text-muted-foreground mb-6">{cfg.desc}</p>
          <div className="flex gap-3 justify-center">
            <Button asChild className="gradient-primary border-0 text-white">
              <Link to="/app/cliente/pedidos">Meus pedidos <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline"><Link to="/">Voltar à loja</Link></Button>
          </div>
        </Card>
      </main>
      <PublicFooter />
    </div>
  );
}
