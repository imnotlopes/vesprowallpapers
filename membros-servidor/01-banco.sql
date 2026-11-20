-- =====================================================================
-- ÁREA DE MEMBROS VESPRO: BANCO DE DADOS (Supabase)
-- Rodar uma vez no Supabase: SQL Editor > New query > colar tudo > Run.
-- Depois rodar o 02-links.sql (links do Drive, fica fora do GitHub).
-- =====================================================================

-- Coleções e os links de download (só saem do banco para quem comprou)
create table if not exists public.colecoes (
  id     text primary key,               -- signature, essencial, shadows, sporting, exclusivas, movies
  nome   text not null,
  links  jsonb not null default '{}',    -- {"desktop": "...", "celular": "...", "todos": "...", "pasta": "..."}
  ativa  boolean not null default true
);

-- Produtos vendidos em cada plataforma e as coleções que cada um libera.
-- "acervo" libera TODAS as coleções, inclusive as que forem criadas depois (acesso VIP).
create table if not exists public.produtos (
  codigo     text primary key,           -- código do checkout/produto na plataforma
  plataforma text not null,              -- wiapy, lojou, stripe
  nome       text,
  colecoes   text[] not null
);

-- Cada compra que chega pelos webhooks (ou que você cadastra à mão)
create table if not exists public.compras (
  id         bigserial primary key,
  email      text not null,
  colecoes   text[] not null,
  loja       text not null default 'br', -- país da compra: br (Wiapy), za (Lojou). Cada país tem a sua área de membros.
  plataforma text,
  pedido     text not null default '',
  produto    text not null default '',
  valor      numeric,                    -- valor pago, na moeda da loja
  status     text not null default 'aprovada',  -- aprovada | reembolsada
  criado_em  timestamptz not null default now(),
  unique (plataforma, pedido, produto)
);
create index if not exists compras_email_idx on public.compras (lower(email));

-- Tudo que os checkouts mandam fica guardado aqui, para conferir e corrigir
create table if not exists public.eventos (
  id         bigserial primary key,
  plataforma text,
  payload    jsonb,
  resultado  text,
  criado_em  timestamptz not null default now()
);

-- Ninguém lê essas tabelas direto pela internet. A página só usa a função minha_area().
alter table public.colecoes enable row level security;
alter table public.produtos enable row level security;
alter table public.compras  enable row level security;
alter table public.eventos  enable row level security;

-- O que a pessoa logada recebe NA ÁREA DO PAÍS p_loja: as coleções compradas nesse país (com links),
-- se é VIP e quanto já pagou ali. Uma compra no Brasil não aparece na área da África do Sul e vice-versa.
drop function if exists public.minha_area();
create or replace function public.minha_area(p_loja text default 'br')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email  text := lower(auth.jwt() ->> 'email');
  v_cols   text[];
  v_acervo boolean;
  v_pago   numeric;
begin
  if v_email is null then return null; end if;

  select coalesce(array_agg(distinct c), '{}') into v_cols
    from public.compras, unnest(colecoes) as c
   where lower(email) = v_email and status = 'aprovada' and loja = p_loja;

  v_acervo := 'acervo' = any(v_cols);

  select coalesce(sum(valor), 0) into v_pago from public.compras
   where lower(email) = v_email and status = 'aprovada' and loja = p_loja;

  return jsonb_build_object(
    'acervo', v_acervo,
    'loja', p_loja,
    'pago', v_pago,
    'colecoes', coalesce((
      select jsonb_object_agg(id, links) from public.colecoes
       where ativa and (v_acervo or id = any(v_cols))
    ), '{}'::jsonb)
  );
end;
$$;
revoke all on function public.minha_area(text) from public, anon;
grant execute on function public.minha_area(text) to authenticated;

-- ---------------------------------------------------------------------
-- Coleções (os links entram no 02-links.sql)
-- ---------------------------------------------------------------------
insert into public.colecoes (id, nome) values
  ('signature',  'VESPRO Signature Collection™'),
  ('essencial',  'VESPRO Essential Collection™'),
  ('shadows',    'VESPRO Shadows Collection™'),
  ('sporting',   'VESPRO Sporting Collection™'),
  ('exclusivas', 'VESPRO Exclusive Expansion™'),
  ('movies',     'VESPRO Movies™')
on conflict (id) do update set nome = excluded.nome;

-- ---------------------------------------------------------------------
-- Produtos já existentes (códigos tirados dos links de checkout)
-- Order bumps da Wiapy: o webhook reconhece pelo nome (Shadows, Sporting, Combo...).
-- Produto novo: acrescente uma linha aqui.
-- ---------------------------------------------------------------------
insert into public.produtos (codigo, plataforma, nome, colecoes) values
  -- Wiapy (Brasil)
  ('Lb6irRZR-uLn', 'wiapy', 'Coleção Essencial (+75)',                   '{essencial}'),
  ('SdUNug8FDfso', 'wiapy', 'Coleção Completa 150 (pop-up)',             '{signature}'),
  ('7fmmsK964ZH8', 'wiapy', 'Coleção Completa 150',                      '{signature}'),
  ('oPEAOO9qmrct', 'wiapy', 'VESPRO Movies',                             '{movies}'),
  ('NAhagBuNVr4y', 'wiapy', 'VESPRO Movies + Signature',                 '{movies,signature}'),
  ('u5h0EscLMhD3', 'wiapy', 'VESPRO Movies + Signature (pop-up)',        '{movies,signature}'),
  ('6af891a45052a21e210c1fc1', 'wiapy', 'Upsell Acervo (Essencial/Movies)', '{acervo}'),
  ('6af892f1a84994dd38925d55', 'wiapy', 'Upsell Acervo (pop-up)',           '{acervo}'),
  ('6af8938255667c91c56061d8', 'wiapy', 'Upsell Acervo (Completa)',         '{acervo}'),
  ('te-lcZmlti_g',             'wiapy', 'Upsell Acervo (antigo)',           '{acervo}'),
  -- Wiapy: IDs internos dos produtos (é isso que o webhook da Wiapy manda; lista tirada de Integrações > Webhook em 20/11/2026)
  ('6aa8d1bea3b8e74fff4e7556', 'wiapy', '+75 Wallpapers Vespro™',                         '{essencial}'),
  ('6aa8d4049a25e2b44229d380', 'wiapy', '150 Wallpapers Vespro™',                         '{signature}'),
  ('6aa8d62eaaf047d39e38ae6d', 'wiapy', '150 Wallpapers Vespro™ (pop-up)',                '{signature}'),
  ('6ac6cc3ac7ae865f6eeb9674', 'wiapy', 'Complete Collection Vespro™',                    '{signature}'),
  ('6aca4e98c7ae865f6e5b11ff', 'wiapy', 'Coleção Shadows - Wallpapers Vespro™',           '{shadows}'),
  ('6ad04b026ebcdbf6686b04ed', 'wiapy', '+150 Wallpapers · Expansão Exclusiva',           '{exclusivas}'),
  ('6ad04b28c8bdfc2949532905', 'wiapy', '+150 Wallpapers · Expansão Exclusiva',           '{exclusivas}'),
  ('6aae0316f72e338d1599a0ec', 'wiapy', '+150 Wallpapers · Expansão Exclusiva',           '{exclusivas}'),
  ('6af6357b2cbc3c959607cfe1', 'wiapy', 'Acervo Completo VESPRO™',                        '{acervo}'),
  ('6af632fdac6765bc3bb6da7b', 'wiapy', 'Acervo Completo VESPRO™',                        '{acervo}'),
  ('6af94b4ba84994dd38ab2895', 'wiapy', 'VESPRO Movies™',                                 '{movies}'),
  ('6af94d38f22d19f67561af7f', 'wiapy', 'VESPRO Movies™ + Signature Collection™',         '{movies,signature}'),
  ('6af94e16a84994dd38ab51ba', 'wiapy', 'VESPRO Movies™ + Signature Collection™',         '{movies,signature}'),
  -- '120 Wallpapers Vespro™ (Celular)' (6ac910ba3f18161e1ecbcc11): falta decidir qual coleção libera
  -- Lojou (África do Sul, área própria em za.vesprowallpapers.com/members/)
  ('5844', 'lojou', 'VESPRO Essential Collection',                 '{essencial}'),
  ('5832', 'lojou', 'VESPRO Complete Collection',                  '{signature}'),
  ('5847', 'lojou', 'VESPRO Complete Collection (Special Offer)',  '{signature}'),
  ('5845', 'lojou', 'VESPRO Movies',                               '{movies}'),
  ('5846', 'lojou', 'VESPRO Movies + Signature',                   '{movies,signature}'),
  ('5848', 'lojou', 'VESPRO Movies + Signature (Special Offer)',   '{movies,signature}'),
  ('5850', 'lojou', 'VESPRO Shadows Collection',                   '{shadows}'),
  ('5851', 'lojou', 'VESPRO Sporting Collection',                  '{sporting}'),
  ('5852', 'lojou', 'Shadows + Sporting + Movies Bundle',          '{shadows,sporting,movies}'),
  ('5853', 'lojou', 'Shadows + Sporting Bundle',                   '{shadows,sporting}'),
  ('5854', 'lojou', 'VESPRO Complete Archive',                     '{acervo}')
on conflict (codigo) do update set nome = excluded.nome, colecoes = excluded.colecoes, plataforma = excluded.plataforma;

-- ---------------------------------------------------------------------
-- Liberar acesso à mão (ex.: cliente antigo, troca, cortesia). A coluna loja diz em qual área aparece (br ou za):
--   insert into public.compras (email, colecoes, loja, plataforma, pedido, produto, valor)
--   values ('cliente@email.com', '{signature}', 'br', 'manual', 'manual-001', 'Coleção Completa', 21.90);
-- Tirar acesso (reembolso):
--   update public.compras set status = 'reembolsada' where email = 'cliente@email.com';
-- ---------------------------------------------------------------------
