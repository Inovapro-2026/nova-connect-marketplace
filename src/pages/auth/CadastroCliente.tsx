import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CadastroCliente() {
  const nav = useNavigate();
  const [form, setForm] = useState({ nome: '', sobrenome: '', email: '', telefone: '', cpf: '', senha: '', confirma: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = 'Cadastro Cliente — InovaPro Shop'; }, []);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const strength = (() => {
    let s = 0;
    if (form.senha.length >= 8) s++;
    if (/[A-Z]/.test(form.senha)) s++;
    if (/[0-9]/.test(form.senha)) s++;
    if (/[^A-Za-z0-9]/.test(form.senha)) s++;
    return s;
  })();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.nome.length < 3) return toast.error('Nome muito curto');
    if (form.senha.length < 6) return toast.error('Senha precisa de 6+ caracteres');
    if (form.senha !== form.confirma) return toast.error('Senhas não coincidem');

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: {
        emailRedirectTo: `${window.location.origin}/app/cliente`,
        data: {
          nome: form.nome,
          sobrenome: form.sobrenome,
          telefone: form.telefone,
          cpf: form.cpf,
          tipo_conta: 'cliente',
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes('already registered') ? 'E-mail já cadastrado' : error.message);
      return;
    }
    toast.success('Conta criada! Bem-vindo ao InovaPro Shop');
    nav('/app/cliente', { replace: true });
  };

  return (
    <div className="min-h-screen gradient-hero animate-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-6"><Logo size="lg" /></div>
        <Card className="surface-1 border-border/60 backdrop-blur p-8 shadow-elegant">
          <h1 className="text-2xl font-display font-bold mb-1">Criar conta de cliente</h1>
          <p className="text-sm text-muted-foreground mb-6">Compre produtos e contrate serviços</p>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" value={form.nome} onChange={(e) => update('nome', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sobrenome">Sobrenome</Label>
                <Input id="sobrenome" value={form.sobrenome} onChange={(e) => update('sobrenome', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="tel">Telefone</Label>
                <Input id="tel" value={form.telefone} onChange={(e) => update('telefone', e.target.value)} placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" value={form.cpf} onChange={(e) => update('cpf', e.target.value)} placeholder="000.000.000-00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" type="password" value={form.senha} onChange={(e) => update('senha', e.target.value)} required />
              <div className="flex gap-1 h-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`flex-1 rounded transition-colors ${
                    strength >= i
                      ? strength <= 1 ? 'bg-destructive' : strength === 2 ? 'bg-warning' : strength === 3 ? 'bg-accent' : 'bg-success'
                      : 'bg-muted'
                  }`} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="conf">Confirmar senha</Label>
              <Input id="conf" type="password" value={form.confirma} onChange={(e) => update('confirma', e.target.value)} required />
            </div>

            <Button type="submit" disabled={loading} className="w-full gradient-primary text-white border-0 hover:opacity-90 glow">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar conta'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm space-y-2">
            <Link to="/auth/login" className="text-muted-foreground hover:text-foreground">Já tenho conta</Link>
            <div>
              <Link to="/auth/cadastro/vendedor" className="text-primary hover:underline">Quero me cadastrar como vendedor</Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
