// Edge function: cria preferência no Mercado Pago e cria pedidos no Supabase
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ItemIn { id: string; name: string; price: number; quantity: number; seller_id: string; }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const auth = req.headers.get('Authorization');
    if (!auth) return j({ error: 'unauthorized' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: auth } } },
    );
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: { user }, error: ue } = await supabase.auth.getUser();
    if (ue || !user) return j({ error: 'unauthorized' }, 401);

    const body = await req.json().catch(() => null);
    if (!body?.items?.length) return j({ error: 'items required' }, 400);
    const items: ItemIn[] = body.items;

    const { data: usuario } = await admin.from('usuarios').select('id, email, nome').eq('auth_user_id', user.id).maybeSingle();
    if (!usuario) return j({ error: 'usuario não encontrado' }, 400);

    const total = items.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);

    // Cria 1 pedido por vendedor (split simples)
    const bySeller = new Map<string, ItemIn[]>();
    for (const it of items) {
      const arr = bySeller.get(it.seller_id) ?? [];
      arr.push(it); bySeller.set(it.seller_id, arr);
    }

    const pedidos: { id: string; numero: string }[] = [];
    for (const [seller_auth_id, arr] of bySeller) {
      const { data: vu } = await admin.from('usuarios').select('id').eq('auth_user_id', seller_auth_id).maybeSingle();
      if (!vu) continue;
      const { data: pv } = await admin.from('perfis_vendedor').select('id').eq('usuario_id', vu.id).maybeSingle();
      if (!pv) continue;

      const subtotal = arr.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
      const taxa = Math.round(subtotal * 0.10 * 100) / 100;
      const liquido = Math.round((subtotal - taxa) * 100) / 100;

      const { data: pedido, error: pe } = await admin.from('pedidos').insert({
        cliente_id: usuario.id,
        vendedor_id: pv.id,
        produto_id: arr[0].id,
        valor_total: subtotal,
        taxa_plataforma: taxa,
        valor_liquido_vendedor: liquido,
        status: 'aguardando',
        gateway: 'mercadopago',
        metodo_pagamento: 'mercadopago',
      }).select('id, numero').single();
      if (pe) { console.error('pedido', pe); continue; }
      pedidos.push(pedido!);
    }

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) return j({ error: 'MERCADOPAGO_ACCESS_TOKEN ausente' }, 500);

    const origin = req.headers.get('origin') ?? Deno.env.get('APP_URL') ?? 'https://inovapro.shop';

    const pref = {
      items: items.map((i) => ({
        id: i.id,
        title: i.name.slice(0, 80),
        quantity: Number(i.quantity),
        unit_price: Number(i.price),
        currency_id: 'BRL',
      })),
      payer: { email: usuario.email, name: usuario.nome },
      back_urls: {
        success: `${origin}/checkout/retorno?status=success`,
        pending: `${origin}/checkout/retorno?status=pending`,
        failure: `${origin}/checkout/retorno?status=failure`,
      },
      auto_return: 'approved',
      external_reference: pedidos.map((p) => p.id).join(','),
      statement_descriptor: 'INOVAPRO',
    };

    const r = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(pref),
    });
    const data = await r.json();
    if (!r.ok) {
      console.error('MP error', data);
      return j({ error: 'mp_error', detail: data }, 500);
    }

    return j({ init_point: data.init_point, sandbox_init_point: data.sandbox_init_point, total, pedidos });
  } catch (e: any) {
    console.error(e);
    return j({ error: e?.message ?? 'unknown' }, 500);
  }
});

function j(d: unknown, status = 200) {
  return new Response(JSON.stringify(d), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
