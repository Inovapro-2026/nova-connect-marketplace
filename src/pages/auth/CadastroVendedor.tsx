import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CadastroVendedor() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    nome: '', sobrenome: '', email: '', telefone: '', cpf: '', senha: '', confirma: '',
    nome_loja: '', bio: '', pix: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = 'Cadastro Vendedor — InovaPro Shop'; }, []);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.nome.length < 3) return toast.error('Nome muito curto');
    if (form.senha.length < 6) return toast.error('Senha precisa de 6+ caracteres');
    if (form.senha !== form.confirma) return toast.error('Senhas não coincidem');
    if (!form.nome_loja) return toast.error('Informe o nome da loja');

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: {
        emailRedirectTo: `${window.location.origin}/app/vendedor`,
        data: {
          nome: form.nome,
          sobrenome: form.sobrenome,
          telefone: form.telefone,
          cpf: form.cpf,
          tipo_conta: 'vendedor',
        },
      },
    });

    if (error) {
      setLoading(false);
      toast.error(error.message.includes('already registered') ? 'E-mail já cadastrado' : error.message);
      return;
    }

    // Criar/atualizar perfil de vendedor depois do trigger
    if (data.user) {
      // Aguarda o trigger criar usuarios + perfis_vendedor
      await new Promise((r) => setTimeout(r, 800));
      const { data: u } = await supabase.from('usuarios').select('id').eq('auth_user_id', data.user.id).maybeSingle();
      if (u) {
        await supabase.from('perfis_vendedor').upsert({
          usuario_id: u.id,
          nome_profissional: form.nome_loja,
          bio: form.bio,
          chave_pix: form.pix,
        }, { onConflict: 'usuario_id' });
      }
    }

    setLoading(false);
    toast.success('Conta de vendedor criada!');
    nav('/app/vendedor', { replace: true });
  };

  return (
    <div className="min-h-screen gradient-hero animate-gradient flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-6"><Logo size="lg" /></div>
        <Card className="surface-1 border-border/60 backdrop-blur p-8 shadow-elegant">
          <h1 className="text-2xl font-display font-bold mb-1">Criar conta de vendedor</h1>
          <p className="text-sm text-muted-foreground mb-6">Venda produtos e ofereça serviços</p>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nome</Label>
                <Input value={form.nome} onChange={(e) => update('nome', e.target.value)} required /></div>
              <div className="space-y-2"><Label>Sobrenome</Label>
                <Input value={form.sobrenome} onChange={(e) => update('sobrenome', e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Telefone</Label>
                <Input value={form.telefone} onChange={(e) => update('telefone', e.target.value)} placeholder="(11) 99999-9999" /></div>
              <div className="space-y-2"><Label>CPF/CNPJ</Label>
                <Input value={form.cpf} onChange={(e) => update('cpf', e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Nome da loja</Label>
              <Input value={form.nome_loja} onChange={(e) => update('nome_loja', e.target.value)} required /></div>
            <div className="space-y-2">
              <Label>Bio profissional <span className="text-xs text-muted-foreground">({form.bio.length}/300)</span></Label>
              <Textarea maxLength={300} value={form.bio} onChange={(e) => update('bio', e.target.value)} rows={3} />
            </div>
            <div className="space-y-2"><Label>Chave Pix (recebimentos)</Label>
              <Input value={form.pix} onChange={(e) => update('pix', e.target.value)} /></div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Senha</Label>
                <Input type="password" value={form.senha} onChange={(e) => update('senha', e.target.value)} required /></div>
              <div className="space-y-2"><Label>Confirmar</Label>
                <Input type="password" value={form.confirma} onChange={(e) => update('confirma', e.target.value)} required /></div>
            </div>

            <Button type="submit" disabled={loading} className="w-full gradient-primary text-white border-0 hover:opacity-90 glow">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar conta de vendedor'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link to="/auth/login" className="text-muted-foreground hover:text-foreground">Já tenho conta</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
