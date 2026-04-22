import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Props { mode: 'cliente' | 'vendedor'; }

export default function MinhaConta({ mode }: Props) {
  const { user, refreshUsuario } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usuario, setUsuario] = useState({ id: '', nome: '', sobrenome: '', telefone: '', avatar_url: '' });
  const [perfilV, setPerfilV] = useState({ id: '', headline: '', bio: '', localizacao: '', pix_tipo: '', pix_chave: '' });

  useEffect(() => {
    document.title = 'Minha conta — InovaPro Shop';
    if (!user) return;
    (async () => {
      const { data: u } = await supabase.from('usuarios')
        .select('id, nome, sobrenome, telefone, avatar_url').eq('auth_user_id', user.id).maybeSingle();
      if (u) setUsuario({
        id: u.id, nome: u.nome ?? '', sobrenome: u.sobrenome ?? '',
        telefone: u.telefone ?? '', avatar_url: u.avatar_url ?? '',
      });
      if (mode === 'vendedor' && u) {
        const { data: pv } = await supabase.from('perfis_vendedor')
          .select('id, headline, bio, localizacao, pix_tipo, pix_chave').eq('usuario_id', u.id).maybeSingle();
        if (pv) setPerfilV({ 
          id: pv.id, 
          headline: pv.headline ?? '', 
          bio: pv.bio ?? '', 
          localizacao: pv.localizacao ?? '',
          pix_tipo: pv.pix_tipo ?? '',
          pix_chave: pv.pix_chave ?? '',
        });
      }
      setLoading(false);
    })();
  }, [user, mode]);

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) return toast.error('Falha no upload');
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
    setUsuario((u) => ({ ...u, avatar_url: pub.publicUrl }));
    toast.success('Avatar enviado');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !usuario.id) return;
    setSaving(true);
    const { error: e1 } = await supabase.from('usuarios').update({
      nome: usuario.nome, sobrenome: usuario.sobrenome,
      telefone: usuario.telefone || null, avatar_url: usuario.avatar_url || null,
    }).eq('id', usuario.id);

    let e2: any = null;
    if (mode === 'vendedor' && perfilV.id) {
      const r = await supabase.from('perfis_vendedor').update({
        headline: perfilV.headline || null, 
        bio: perfilV.bio || null, 
        localizacao: perfilV.localizacao || null,
        pix_tipo: perfilV.pix_tipo || null,
        pix_chave: perfilV.pix_chave || null,
      }).eq('id', perfilV.id);
      e2 = r.error;
    }

    setSaving(false);
    if (e1 || e2) toast.error('Erro ao salvar');
    else { toast.success('Dados atualizados'); refreshUsuario(); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-bold">Minha conta</h1>
        <p className="text-muted-foreground">Atualize seus dados pessoais</p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <Card className="surface-1 border-border/50 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-surface-2 overflow-hidden flex items-center justify-center">
              {usuario.avatar_url ? <img src={usuario.avatar_url} alt="" className="h-full w-full object-cover" /> : <UserIcon className="h-8 w-8 text-muted-foreground" />}
            </div>
            <div>
              <input id="ava" type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
              <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('ava')?.click()}>Trocar avatar</Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div><Label htmlFor="nome">Nome</Label><Input id="nome" value={usuario.nome} onChange={(e) => setUsuario({ ...usuario, nome: e.target.value })} /></div>
            <div><Label htmlFor="sobr">Sobrenome</Label><Input id="sobr" value={usuario.sobrenome} onChange={(e) => setUsuario({ ...usuario, sobrenome: e.target.value })} /></div>
          </div>
          <div><Label htmlFor="tel">Telefone</Label><Input id="tel" value={usuario.telefone} onChange={(e) => setUsuario({ ...usuario, telefone: e.target.value })} /></div>
        </Card>

        {mode === 'vendedor' && (
          <>
            <Card className="surface-1 border-border/50 p-6 space-y-4">
              <h3 className="font-display font-semibold">Perfil profissional</h3>
              <div><Label htmlFor="head">Headline</Label><Input id="head" placeholder="Ex: Designer especialista em UI/UX" value={perfilV.headline} onChange={(e) => setPerfilV({ ...perfilV, headline: e.target.value })} /></div>
              <div><Label htmlFor="bio">Bio</Label><Textarea id="bio" rows={4} value={perfilV.bio} onChange={(e) => setPerfilV({ ...perfilV, bio: e.target.value })} /></div>
              <div><Label htmlFor="loc">Localização</Label><Input id="loc" placeholder="Cidade — Estado" value={perfilV.localizacao} onChange={(e) => setPerfilV({ ...perfilV, localizacao: e.target.value })} /></div>
            </Card>

            <Card className="surface-1 border-border/50 p-6 space-y-4">
              <h3 className="font-display font-semibold">Dados de Saque (PIX)</h3>
              <p className="text-xs text-muted-foreground">Estes dados serão usados para enviar seus pagamentos.</p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="pix_tipo">Tipo de Chave</Label>
                  <select id="pix_tipo" value={perfilV.pix_tipo} 
                    onChange={(e) => setPerfilV({ ...perfilV, pix_tipo: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">— Selecione —</option>
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="email">E-mail</option>
                    <option value="telefone">Telefone</option>
                    <option value="aleatoria">Chave Aleatória</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="pix_chave">Chave PIX</Label>
                  <Input id="pix_chave" placeholder="Digite sua chave" value={perfilV.pix_chave} onChange={(e) => setPerfilV({ ...perfilV, pix_chave: e.target.value })} />
                </div>
              </div>
            </Card>
          </>
        )}

        <Button type="submit" disabled={saving} className="gradient-primary border-0 text-white">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Salvar alterações
        </Button>
      </form>
    </div>
  );
}
