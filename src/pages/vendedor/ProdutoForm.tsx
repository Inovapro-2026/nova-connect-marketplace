import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, ArrowLeft, Save, AlertCircle, ShoppingBag, Users } from 'lucide-react';
import { toast } from 'sonner';
import { CategoryAutocomplete } from '@/components/shared/CategoryAutocomplete';

interface Categoria { id: string; nome: string; slug: string; }

export default function ProdutoForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const { user } = useAuth();
  const nav = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    categoria_id: '',
    image_url: '',
    external_link: '',
    item_type: 'produto' as 'produto' | 'servico',
    status: 'draft' as 'draft' | 'published',
  });

  useEffect(() => {
    document.title = isEdit ? 'Editar item — InovaPro Shop' : 'Novo item — InovaPro Shop';
    supabase.from('categorias').select('id, nome, slug').eq('ativo', true).order('ordem')
      .then(({ data }) => setCategorias(data ?? []));

    if (isEdit && id) {
      // Try products first
      supabase.from('products').select('*').eq('id', id).maybeSingle().then(({ data: pData }) => {
        if (pData) {
          setForm({
            name: pData.name ?? '',
            description: pData.description ?? '',
            price: String(pData.price ?? ''),
            categoria_id: pData.categoria_id ?? '',
            image_url: pData.image_url ?? '',
            external_link: pData.external_link ?? '',
            item_type: 'produto',
            status: (pData.status === 'archived' ? 'draft' : pData.status) as 'draft' | 'published',
          });
          setLoading(false);
        } else {
          // Try services
          supabase.from('servicos').select('*').eq('id', id).maybeSingle().then(({ data: sData }) => {
            if (sData) {
              setForm({
                name: sData.titulo ?? '',
                description: sData.descricao_completa ?? '',
                price: String(sData.preco_base ?? ''),
                categoria_id: sData.categoria_id ?? '',
                image_url: sData.imagem_principal_url ?? '',
                external_link: '',
                item_type: 'servico',
                status: (sData.status === 'publicado' ? 'published' : 'draft'),
              });
              setLoading(false);
            } else {
              toast.error('Item não encontrado');
              nav('/app/vendedor/produtos');
            }
          });
        }
      });
    }
  }, [id, isEdit, nav]);

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('product-images').upload(path, file, { upsert: false });
    if (upErr) { toast.error('Falha no upload'); setUploading(false); return; }
    const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: pub.publicUrl }));
    setUploading(false);
    toast.success('Imagem enviada');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim()) return toast.error('Informe o nome do item');
    const priceNum = Number(form.price.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) return toast.error('Informe um preço válido');

    setSaving(true);
    
    // 1. Resolve seller profile ID
    const { data: u } = await supabase.from('usuarios').select('id').eq('auth_user_id', user.id).maybeSingle();
    const { data: pv } = await supabase.from('perfis_vendedor').select('id').eq('usuario_id', u?.id).maybeSingle();
    
    if (!pv) {
      setSaving(false);
      return toast.error('Perfil de vendedor não encontrado');
    }

    if (form.item_type === 'produto') {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: priceNum,
        categoria_id: form.categoria_id || null,
        image_url: form.image_url || null,
        external_link: form.external_link || null,
        item_type: 'produto',
        status: form.status,
        seller_id: pv.id,
      };

      const { error } = isEdit
        ? await supabase.from('products').update(payload).eq('id', id!)
        : await supabase.from('products').insert(payload);
      
      if (error) { setSaving(false); return toast.error('Erro ao salvar produto: ' + error.message); }
    } else {
      const payload = {
        titulo: form.name.trim(),
        descricao_completa: form.description.trim() || null,
        descricao_curta: form.description.trim().substring(0, 100),
        preco_base: priceNum,
        categoria_id: form.categoria_id || null,
        imagem_principal_url: form.image_url || null,
        status: form.status === 'published' ? 'publicado' : 'rascunho',
        vendedor_id: pv.id,
        slug: form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7)
      };

      const { error } = isEdit
        ? await supabase.from('servicos').update(payload).eq('id', id!)
        : await supabase.from('servicos').insert(payload);

      if (error) { setSaving(false); return toast.error('Erro ao salvar serviço: ' + error.message); }
    }

    setSaving(false);
    toast.success(isEdit ? 'Item atualizado' : 'Item criado');
    nav('/app/vendedor/produtos');
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => nav('/app/vendedor/produtos')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold">{isEdit ? 'Editar item' : 'Novo item'}</h1>
          <p className="text-muted-foreground">Preencha os dados do {form.item_type}</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <Card className="surface-1 border-border/50 p-6 space-y-6">
          <div className="space-y-3">
            <Label>Tipo do item *</Label>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setForm({ ...form, item_type: 'produto' })}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  form.item_type === 'produto' ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]' : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                Produto
              </button>
              <button 
                type="button" 
                onClick={() => setForm({ ...form, item_type: 'servico' })}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  form.item_type === 'servico' ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]' : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                <Users className="h-4 w-4" />
                Serviço
              </button>
            </div>
          </div>

          <div className="grid gap-6">
            <div>
              <Label htmlFor="name">Nome do {form.item_type} *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder={form.item_type === 'produto' ? 'Ex: Template Dashboard React' : 'Ex: Consultoria de Marketing'} />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreva os detalhes, benefícios e o que está incluso..." />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input id="price" type="text" inputMode="decimal" placeholder="99,90"
                value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <CategoryAutocomplete 
                value={form.categoria_id} 
                onChange={(val) => setForm({ ...form, categoria_id: val })}
                itemType={form.item_type}
              />
            </div>
          </div>

          {form.item_type === 'produto' && (
            <div className="space-y-4 pt-4 border-t border-border/50">
              <Label htmlFor="external_link">Entrega do Produto Digital (Link Externo)</Label>
              <div className="flex flex-col md:flex-row gap-3 mb-2">
                <Input 
                  id="external_link" 
                  type="url" 
                  placeholder="Link para download (Drive, Dropbox, etc)"
                  value={form.external_link} 
                  onChange={(e) => setForm({ ...form, external_link: e.target.value })}
                  className="flex-1"
                />
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="flex-1 md:flex-none border-primary/30 hover:bg-primary/5 hover:border-primary"
                    onClick={() => window.open('https://drive.google.com/', '_blank')}
                  >
                    <img src="https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png" alt="" className="h-4 w-4 mr-2" />
                    Drive
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="flex-1 md:flex-none border-accent/30 hover:bg-accent/5 hover:border-accent"
                    onClick={() => window.open('https://ydray.com/en/', '_blank')}
                  >
                    <span className="font-bold text-accent mr-2 italic">Y</span>
                    YDRAY
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Para produtos digitais, o cliente receberá este link automaticamente após a confirmação do pagamento.
              </p>
            </div>
          )}

          {form.item_type === 'servico' && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex gap-3 text-primary text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold mb-1">Atenção: Fluxo de Serviço</p>
                <p className="text-xs text-muted-foreground">Serviços exigem que o cliente inicie uma conversa antes do pagamento. A entrega e acompanhamento serão realizados através do chat.</p>
              </div>
            </div>
          )}
        </Card>

        <Card className="surface-1 border-border/50 p-6 space-y-4">
          <Label>Imagem de destaque</Label>
          {form.image_url && (
            <div className="relative aspect-video bg-surface-2 rounded-lg overflow-hidden max-w-md">
              <img src={form.image_url} alt="Preview" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              id="file" type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
            />
            <Button type="button" variant="outline" disabled={uploading}
              onClick={() => document.getElementById('file')?.click()}>
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              {form.image_url ? 'Trocar imagem' : 'Enviar imagem'}
            </Button>
          </div>
        </Card>

        <Card className="surface-1 border-border/50 p-6 space-y-3">
          <Label>Status</Label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setForm({ ...form, status: 'draft' })}
              className={`flex-1 px-4 py-3 rounded-lg border text-sm transition-all ${
                form.status === 'draft' ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-primary/60'
              }`}>
              <div className="font-semibold">Rascunho</div>
              <div className="text-xs">Salvo, mas não exibido na vitrine</div>
            </button>
            <button type="button" onClick={() => setForm({ ...form, status: 'published' })}
              className={`flex-1 px-4 py-3 rounded-lg border text-sm transition-all ${
                form.status === 'published' ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-primary/60'
              }`}>
              <div className="font-semibold">Publicado</div>
              <div className="text-xs">Visível para todos os clientes</div>
            </button>
          </div>
        </Card>

        <div className="flex gap-3 sticky bottom-4">
          <Button type="submit" disabled={saving} className="gradient-primary border-0 text-white flex-1 md:flex-none">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isEdit ? 'Salvar alterações' : 'Criar produto'}
          </Button>
          <Button type="button" variant="outline" onClick={() => nav('/app/vendedor/produtos')}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
