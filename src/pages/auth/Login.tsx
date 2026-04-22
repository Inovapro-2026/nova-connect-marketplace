import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { Eye, EyeOff, Loader2, Mail, Lock, ShoppingBag, Store } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { homeFor } from '@/components/auth/RoleGuard';

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { user, role, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    document.title = 'Entrar — InovaPro Shop';
  }, []);

  useEffect(() => {
    if (!authLoading && user && role) {
      const from = (loc.state as any)?.from || homeFor(role);
      nav(from, { replace: true });
    }
  }, [authLoading, user, role, nav, loc.state]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pass) {
      toast.error('Preencha email e senha');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'Credenciais inválidas' : error.message);
      return;
    }
    toast.success('Bem-vindo de volta!');
  };

  const sendReset = async () => {
    if (!resetEmail) return;
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else {
      toast.success('Enviamos um link de recuperação para seu e-mail');
      setResetOpen(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero animate-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <Card className="surface-1 border-border/60 backdrop-blur p-8 shadow-elegant">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-display font-bold">Acesse sua conta</h1>
            <p className="text-sm text-muted-foreground mt-1">Marketplace dos criadores digitais</p>
          </div>

          {!resetOpen ? (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="seu@email.com" className="pl-9"
                    value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="senha" type={show ? 'text' : 'password'} placeholder="••••••••" className="pl-9 pr-10"
                    value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" required />
                  <button type="button" onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading}
                className="w-full gradient-primary text-white border-0 hover:opacity-90 glow">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
              </Button>

              <button type="button" onClick={() => setResetOpen(true)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center">
                Esqueci minha senha
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <Label htmlFor="reset">E-mail para recuperação</Label>
              <Input id="reset" type="email" placeholder="seu@email.com"
                value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setResetOpen(false)}>Cancelar</Button>
                <Button className="flex-1 gradient-primary border-0" onClick={sendReset}>Enviar link</Button>
              </div>
            </div>
          )}
        </Card>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link to="/auth/cadastro/cliente"
            className="surface-1 border border-border/60 rounded-xl p-4 hover:border-primary/60 hover:bg-surface-2 transition-all group">
            <ShoppingBag className="h-5 w-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-semibold text-sm">Sou Cliente</div>
            <div className="text-xs text-muted-foreground">Quero comprar</div>
          </Link>
          <Link to="/auth/cadastro/vendedor"
            className="surface-1 border border-border/60 rounded-xl p-4 hover:border-primary/60 hover:bg-surface-2 transition-all group">
            <Store className="h-5 w-5 text-accent mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-semibold text-sm">Sou Vendedor / Freela</div>
            <div className="text-xs text-muted-foreground">Quero vender</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
