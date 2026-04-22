import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PublicHeader, PublicFooter } from '@/components/PublicShell';
import { ArrowRight, Search, Sparkles, Star, Store } from 'lucide-react';
import { formatBRL } from '@/lib/format';

interface Product {
  id: string; name: string; price: number; image_url: string | null;
  category: string | null; seller_id: string;
}

interface Categoria { id: string; nome: string; slug: string; }

interface Counters { produtos: number; vendedores: number; clientes: number; }

export default function Home() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingP, setLoadingP] = useState(true);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [activeCat, setActiveCat] = useState<string>('all');
  const [order, setOrder] = useState<'recent' | 'price_asc' | 'price_desc'>('recent');
  const [counters, setCounters] = useState<Counters>({ produtos: 0, vendedores: 0, clientes: 0 });

  useEffect(() => {
    document.title = 'InovaPro Shop — Marketplace dos criadores digitais';
  }, []);

  useEffect(() => {
    supabase.from('categorias').select('id, nome, slug').eq('ativo', true).order('ordem').then(({ data }) => {
      if (data) setCategorias(data);
    });

    Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('perfis_vendedor').select('id', { count: 'exact', head: true }),
      supabase.from('usuarios').select('id', { count: 'exact', head: true }).eq('tipo_conta', 'cliente'),
    ]).then(([p, v, c]) => {
      setCounters({ produtos: p.count ?? 0, vendedores: v.count ?? 0, clientes: c.count ?? 0 });
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoadingP(true);
    let q: any = (supabase.from('products') as any)
      .select('id, name, price, image_url, category, seller_id')
      .eq('status', 'published')
      .limit(24);

    if (debounced) q = q.ilike('name', `%${debounced}%`);
    if (activeCat !== 'all') q = q.eq('category', activeCat);
    if (order === 'recent') q = q.order('created_at', { ascending: false });
    if (order === 'price_asc') q = q.order('price', { ascending: true });
    if (order === 'price_desc') q = q.order('price', { ascending: false });

    q.then(({ data }: any) => { setProducts((data as Product[]) ?? []); setLoadingP(false); });
  }, [debounced, activeCat, order]);

  const heroStats = useMemo(() => [
    { label: 'Produtos', value: counters.produtos },
    { label: 'Vendedores', value: counters.vendedores },
    { label: 'Clientes', value: counters.clientes },
  ], [counters]);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      {/* HERO */}
      <section className="relative gradient-hero animate-gradient overflow-hidden">
        <div className="container relative py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 surface-1 px-4 py-1.5 text-xs text-muted-foreground mb-6 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Nova plataforma para vendedores e freelancers
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto animate-fade-in">
            O marketplace dos <span className="text-gradient">criadores</span> e vendedores digitais
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in">
            Compre produtos, contrate serviços e conecte-se com os melhores profissionais.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-in">
            <Button asChild size="lg" className="gradient-primary border-0 text-white glow">
              <a href="#produtos">Explorar produtos <ArrowRight className="ml-1 h-4 w-4" /></a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth/cadastro/vendedor">Quero vender</Link>
            </Button>
          </div>

          <div className="mt-12 flex justify-center gap-8 md:gap-16 text-sm">
            {heroStats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-display font-bold text-gradient">{s.value}</div>
                <div className="text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section id="produtos" className="container py-10">
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              className="pl-9 h-12 surface-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-12 rounded-md border border-border bg-input px-3 text-sm"
            value={order}
            onChange={(e) => setOrder(e.target.value as any)}
          >
            <option value="recent">Mais recentes</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCat('all')}
            className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
              activeCat === 'all' ? 'gradient-primary border-transparent text-white' : 'border-border hover:border-primary/60'
            }`}
          >Todos</button>
          {categorias.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.slug)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                activeCat === c.slug ? 'gradient-primary border-transparent text-white' : 'border-border hover:border-primary/60'
              }`}
            >{c.nome}</button>
          ))}
        </div>

        {/* Grid */}
        {loadingP ? (
          <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="surface-1 border-border/50 overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="surface-1 border-border/50 p-12 text-center">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-1">Nenhum produto encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">Tente outros termos ou veja todas as categorias.</p>
            <Button onClick={() => { setSearch(''); setActiveCat('all'); }} variant="outline">Ver todos os produtos</Button>
          </Card>
        ) : (
          <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p, idx) => (
              <Link
                key={p.id}
                to={`/produto/${p.id}`}
                style={{ animationDelay: `${idx * 40}ms` }}
                className="group animate-fade-in"
              >
                <Card className="surface-1 border-border/50 overflow-hidden hover:border-primary/60 transition-all hover:shadow-elegant">
                  <div className="relative aspect-square bg-surface-2 overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <Store className="h-8 w-8" />
                      </div>
                    )}
                    {p.category && (
                      <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur text-foreground border-0">{p.category}</Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2 text-sm mb-2">{p.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-display font-bold text-gradient">{formatBRL(p.price)}</span>
                      <div className="flex items-center text-xs text-muted-foreground gap-0.5">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        <span>—</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <PublicFooter />
    </div>
  );
}
