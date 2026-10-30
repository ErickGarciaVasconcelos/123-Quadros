-- ============================================================================
-- 123 QUADROS — SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS E STORAGE (SUPABASE)
-- Como usar:
-- 1. Acesse seu projeto no painel do Supabase (https://supabase.com/dashboard)
-- 2. No menu lateral esquerdo, clique em "SQL Editor" -> "New query"
-- 3. Cole todo este conteúdo e clique em "Run" (ou Ctrl + Enter)
-- ============================================================================

-- 1. Extensão para geração de UUIDs
create extension if not exists "pgcrypto";

-- 2. Tabela principal de Quadros
create table if not exists public.quadros (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  subtitulo text not null default '',
  preco_original numeric(10, 2) not null check (preco_original >= 0),
  desconto_pct integer not null default 0 check (desconto_pct >= 0 and desconto_pct <= 95),
  preco_final numeric(10, 2) not null check (preco_final >= 0),
  selo text not null default '',                -- ex: 'LANÇAMENTO', 'NOVO', '-35%', 'EM DESTAQUE', ''
  selo_curadoria boolean not null default false, -- selo redondo '2026 CURADORIA DESTAQUE'
  tag_ambiente text not null default '',         -- usado nos cards verticais (ex: 'Sala de Estar')
  secao text not null default 'colecao'          -- 'queridinhos', 'colecao', 'ambos', 'stories'
    check (secao in ('queridinhos', 'colecao', 'ambos', 'stories')),
  categoria text not null default 'paisagem'     -- 'paisagem', 'retrato', 'minimalista', 'abstrato'
    check (categoria in ('paisagem', 'retrato', 'minimalista', 'abstrato')),
  estrelas integer not null default 5 check (estrelas >= 1 and estrelas <= 5),
  imagem_url text not null,
  ativo boolean not null default true,
  ordem integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Índices de performance para listagem rápida na vitrine
create index if not exists idx_quadros_vitrine
  on public.quadros (ativo, secao, ordem asc, created_at desc);

create index if not exists idx_quadros_categoria
  on public.quadros (categoria)
  where ativo = true;

-- 4. Trigger para atualizar `updated_at` automaticamente
create or replace function public.set_quadros_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_quadros_updated_at on public.quadros;
create trigger trg_quadros_updated_at
before update on public.quadros
for each row
execute function public.set_quadros_updated_at();

-- 5. Permissões da Data API (PostgREST) + Row Level Security (RLS)
grant usage on schema public to anon, authenticated;
grant select on public.quadros to anon, authenticated;
grant insert, update, delete on public.quadros to authenticated;

alter table public.quadros enable row level security;

-- Política 1: Visitantes do site (anon) podem ver apenas quadros ativos
drop policy if exists "Visitantes visualizam quadros ativos" on public.quadros;
create policy "Visitantes visualizam quadros ativos"
  on public.quadros
  for select
  to anon
  using (ativo = true);

-- Política 2: Administradores autenticados podem ver todos os quadros (ativos e inativos)
drop policy if exists "Admin visualiza todos os quadros" on public.quadros;
create policy "Admin visualiza todos os quadros"
  on public.quadros
  for select
  to authenticated
  using ((select auth.uid()) is not null);

-- Política 3: Administradores autenticados podem cadastrar novos quadros
drop policy if exists "Admin cadastra quadros" on public.quadros;
create policy "Admin cadastra quadros"
  on public.quadros
  for insert
  to authenticated
  with check ((select auth.uid()) is not null);

-- Política 4: Administradores autenticados podem editar quadros
drop policy if exists "Admin atualiza quadros" on public.quadros;
create policy "Admin atualiza quadros"
  on public.quadros
  for update
  to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

-- Política 5: Administradores autenticados podem excluir quadros
drop policy if exists "Admin exclui quadros" on public.quadros;
create policy "Admin exclui quadros"
  on public.quadros
  for delete
  to authenticated
  using ((select auth.uid()) is not null);

-- ============================================================================
-- 6. CONFIGURAÇÃO DO SUPABASE STORAGE (BUCKET DE IMAGENS DOS QUADROS)
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quadros-imagens',
  'quadros-imagens',
  true,
  5242880, -- limite de 5MB por imagem
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

-- Políticas do Storage (Leitura pública + Upload/Update/Delete para Admin logado)
drop policy if exists "Imagens publicas para leitura" on storage.objects;
create policy "Imagens publicas para leitura"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'quadros-imagens');

drop policy if exists "Admin envia imagens de quadros" on storage.objects;
create policy "Admin envia imagens de quadros"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'quadros-imagens'
    and (select auth.uid()) is not null
  );

drop policy if exists "Admin atualiza imagens de quadros" on storage.objects;
create policy "Admin atualiza imagens de quadros"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'quadros-imagens'
    and (select auth.uid()) is not null
  )
  with check (
    bucket_id = 'quadros-imagens'
    and (select auth.uid()) is not null
  );

drop policy if exists "Admin remove imagens de quadros" on storage.objects;
create policy "Admin remove imagens de quadros"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'quadros-imagens'
    and (select auth.uid()) is not null
  );

-- ============================================================================
-- 7. CARGA INICIAL (SEED) — QUADROS ATUAIS DO SITE
-- Popula a tabela apenas se ela estiver vazia
-- ============================================================================
insert into public.quadros (
  titulo, subtitulo, preco_original, desconto_pct, preco_final,
  selo, selo_curadoria, tag_ambiente, secao, categoria, estrelas, imagem_url, ativo, ordem
)
select * from (values
  -- Queridinhos
  ('Aurora Setentrional', 'Quadro Fine Art em tela canvas 100% algodão com acabamento acetinado.', 249.90, 0, 249.90, 'LANÇAMENTO', false, '', 'queridinhos', 'paisagem', 4, 'imagens/colecao/obra-1.jpg', true, 1),
  ('Maré de Vidro', 'Obra com acabamento Soft Matte, máxima fidelidade de cor e efeito natural.', 219.90, 0, 219.90, 'LANÇAMENTO', false, '', 'queridinhos', 'abstrato', 4, 'imagens/colecao/obra-2.webp', true, 2),
  ('Acervo Autoral I', 'Obra original assinada com acabamento em caixa alta e proteção antirreflexo.', 299.90, 40, 179.90, '-40%', true, '', 'queridinhos', 'retrato', 4, 'imagens/autora/autora-01.jpg', true, 3),
  ('Cerejeira ao Sul', 'Impressão botânica de alta definição com traços suaves e elegantes.', 299.90, 35, 194.90, '-35%', false, '', 'ambos', 'retrato', 5, 'imagens/colecao/obra-5.webp', true, 4),
  ('Fim de Tarde', 'Luz quente e traços orgânicos. Ideal para salas de estar e quartos.', 229.90, 0, 229.90, 'NOVO', false, '', 'ambos', 'paisagem', 5, 'imagens/colecao/obra-3.jpg', true, 5),
  ('Acervo Autoral II', 'Arte contemporânea exclusiva com acabamento refinado de galeria.', 253.20, 25, 189.90, '-25%', false, '', 'queridinhos', 'abstrato', 5, 'imagens/autora/autora-02.jpg', true, 6),

  -- Coleção Completa (adicionais)
  ('Noir IV', 'Diego Lemos · Contraste contemporâneo', 259.90, 0, 259.90, '', false, '', 'colecao', 'minimalista', 5, 'imagens/colecao/obra-6.webp', true, 7),
  ('Jardim Suspenso', 'Helena Dias · Arte botânica', 239.90, 0, 239.90, '', false, '', 'colecao', 'retrato', 4, 'imagens/colecao/obra-7.webp', true, 8),

  -- Carrossel Vertical (Stories / Ambientes)
  ('Série Botânica V', 'Ambiente Sala de Estar', 189.90, 0, 189.90, '', false, 'Sala de Estar', 'stories', 'retrato', 5, 'imagens/autora/autora-05.jpg', true, 1),
  ('Estudo Cromático VI', 'Textura & Arte', 189.90, 0, 189.90, '', false, 'Textura & Arte', 'stories', 'abstrato', 5, 'imagens/autora/autora-06.jpg', true, 2),
  ('Composição Autoral III', 'Destaque Principal', 238.90, 0, 238.90, 'EM DESTAQUE', false, 'Em Destaque', 'stories', 'abstrato', 5, 'imagens/autora/autora-03.jpg', true, 3),
  ('Horizonte Dourado VIII', 'Moldura Artesanal', 269.90, 0, 269.90, '', false, 'Moldura Artesanal', 'stories', 'paisagem', 5, 'imagens/autora/autora-08.jpg', true, 4),
  ('Essência Floral IX', 'Favorito dos Clientes', 199.90, 0, 199.90, '', false, 'Favorito', 'stories', 'retrato', 5, 'imagens/autora/autora-09.jpg', true, 5)
) as v(
  titulo, subtitulo, preco_original, desconto_pct, preco_final,
  selo, selo_curadoria, tag_ambiente, secao, categoria, estrelas, imagem_url, ativo, ordem
)
where not exists (select 1 from public.quadros limit 1);

