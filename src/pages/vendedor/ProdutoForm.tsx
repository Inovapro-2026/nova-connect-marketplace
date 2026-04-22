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

export default function ProdutoForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const { user } = useAuth();
  const nav = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    categoria_id: '',
    image_url: '',
    external_link: '',
    item_type: 'produto' as 'produto' | 'servico',
    status: 'draft' as 'draft' | 'published',
    prazo_estimado: '',
  });

  useEffect(() => {
    document.title = isEdit ? 'Editar item — InovaPro Shop' : 'Novo item — InovaPro Shop';
    
    if (isEdit && id) {
      loadData();
    }
  }, [id, isEdit]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Try products table
      const { data: pData } = await supabase.from('products' as any).select('*').eq('id', id).maybeSingle();
      
      if (pData) {
        setForm({
          name: pData.name || pData.nome || '',
          description: pData.description || pData.descricao_completa || '',
          price: String(pData.price || pData.preco || ''),
          categoria_id: pData.category_id || pData.categoria_id || '',
          image_url: pData.image_url || pData.imagem || '',
          external_link: pData.external_link || '',
          item_type: 'produto',
          status: (pData.status === 'archived' ? 'draft' : pData.status) as any,
          prazo_estimado: '',
        });
      } else {
        // Try services table
        const { data: sData } = await (supabase.from('services' as any).select('*') as any).eq('id', id).maybeSingle();
        if (sData) {
          setForm({
            name: sData.nome || sData.titulo || '',
            description: sData.descricao_completa || '',
            price: String(sData.preco_base || ''),
            categoria_id: sData.category_id || sData.categoria_id || '',
            image_url: sData.imagem || sData.imagem_principal_url || '',
            external_link: '',
            item_type: 'servico',
            status: (sData.status === 'published' || sData.status === 'publicado') ? 'published' : 'draft',
            prazo_estimado: sData.prazo_estimado || '',
          });
        } else {
          toast.error('Item não encontrado');
          nav('/app/vendedor/produtos');
        }
      }
    } catch (err) {
      console.error('Error loading item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('product-images').upload(path, file);
      if (upErr) throw upErr;
      
      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: pub.publicUrl }));
      toast.success('Imagem enviada');
    } catch (err) {
      toast.error('Falha no upload');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim()) return toast.error('Informe o nome do item');
    
    const priceNum = Number(form.price.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) return toast.error('Informe um preço válido');

    setSaving(true);
    try {
      const { data: u } = await supabase.from('usuarios').select('id').eq('auth_user_id', user.id).maybeSingle();
      const { data: pv } = await supabase.from('perfis_vendedor').select('id').eq('usuario_id', u?.id).maybeSingle();
      
      const finalSellerId = pv?.id;

      if (!finalSellerId) {
        throw new Error('Perfil de vendedor não encontrado. Complete seu cadastro operacional.');
      }

      if (form.item_type === 'produto') {
        const payload = {
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: priceNum,
          category_id: form.categoria_id || null,
          image_url: form.image_url || null,
          external_link: form.external_link || null,
          status: form.status,
          seller_id: finalSellerId,
          updated_at: new Date().toISOString(),
        };

        const { error } = isEdit
          ? await supabase.from('products' as any).update(payload).eq('id', id!)
          : await supabase.from('products' as any).insert(payload);
        
        if (error) throw error;
      } else {
        const payload = {
          nome: form.name.trim(),
          descricao_completa: form.description.trim() || null,
          descricao_curta: form.description.trim().substring(0, 100),
          preco_base: priceNum,
          category_id: form.categoria_id || null,
          imagem: form.image_url || null,
          status: form.status,
          seller_id: finalSellerId,
          prazo_estimado: form.prazo_estimado,
          updated_at: new Date().toISOString(),
        };

        const { error } = isEdit
          ? await supabase.from('services' as any).update(payload).eq('id', id!)
          : await supabase.from('services' as any).insert(payload);

        if (error) throw error;
      }

      toast.success(isEdit ? 'Item atualizado' : 'Item criado');
      nav('/app/vendedor/produtos');
    } catch (err: any) {
      toast.error('Erro ao salvar item: ' + err.message);
    } finally {
      setSaving(false);
    }
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
                  form.item_type === 'produto' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                Produto
              </button>
              <button 
                type="button" 
                onClick={() => setForm({ ...form, item_type: 'servico' })}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  form.item_type === 'servico' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
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
              <Label htmlFor="description">Descrição Completa</Label>
              <Textarea id="description" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input id="price" type="text" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            {form.item_type === 'servico' && (
              <div>
                <Label htmlFor="prazo">Prazo Estimado</Label>
                <Input id="prazo" value={form.prazo_estimado} onChange={(e) => setForm({ ...form, prazo_estimado: e.target.value })} placeholder="Ex: 3 dias úteis" />
              </div>
            )}
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
              <Label htmlFor="external_link">Link de Entrega Digital</Label>
              <Input id="external_link" value={form.external_link} onChange={(e) => setForm({ ...form, external_link: e.target.value })} placeholder="https://..." />
            </div>
          )}
        </Card>

        <Card className="surface-1 border-border/50 p-6 space-y-4">
          <Label>Imagem</Label>
          {form.image_url && (
            <div className="relative aspect-video bg-surface-2 rounded-lg overflow-hidden max-w-md">
              <img src={form.image_url} alt="Preview" className="h-full w-full object-cover" />
            </div>
          )}
          <input id="file" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
          <Button type="button" variant="outline" onClick={() => document.getElementById('file')?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {form.image_url ? 'Trocar imagem' : 'Enviar imagem'}
          </Button>
        </Card>

        <Card className="surface-1 border-border/50 p-6 space-y-3">
          <Label>Status</Label>
          <div className="flex gap-3">
            <Button type="button" variant={form.status === 'draft' ? 'default' : 'outline'} onClick={() => setForm({ ...form, status: 'draft' })} className="flex-1">Rascunho</Button>
            <Button type="button" variant={form.status === 'published' ? 'default' : 'outline'} onClick={() => setForm({ ...form, status: 'published' })} className="flex-1">Publicado</Button>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar
          </Button>
          <Button type="button" variant="outline" onClick={() => nav('/app/vendedor/produtos')}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
