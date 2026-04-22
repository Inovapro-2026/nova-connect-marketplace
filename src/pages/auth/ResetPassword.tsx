import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { toast } from 'sonner';

export default function ResetPassword() {
  const nav = useNavigate();
  const [pass, setPass] = useState('');
  const [conf, setConf] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = 'Nova senha — InovaPro Shop'; }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass.length < 6) return toast.error('Mínimo 6 caracteres');
    if (pass !== conf) return toast.error('Senhas não coincidem');
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pass });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success('Senha atualizada!'); nav('/auth/login'); }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-6"><Logo size="lg" /></div>
        <Card className="surface-1 border-border/60 p-8">
          <h1 className="text-2xl font-display font-bold mb-6">Definir nova senha</h1>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label>Nova senha</Label>
              <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Confirmar</Label>
              <Input type="password" value={conf} onChange={(e) => setConf(e.target.value)} required /></div>
            <Button disabled={loading} className="w-full gradient-primary border-0">
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
