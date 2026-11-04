-- ============================================================================
-- 123quadro — REFORÇO DE SEGURANÇA DO PAINEL ADMINISTRATIVO (SUPABASE)
-- ----------------------------------------------------------------------------
-- Execute este script no SQL Editor do Supabase ANTES de usar o painel em
-- produção. Ele troca a regra "qualquer usuário autenticado pode alterar"
-- por "somente usuários da tabela admin_users podem alterar".
--
-- PASSO A PASSO
-- 1. Em Authentication > Users, crie o usuário administrador e copie o UUID.
-- 2. Rode este script inteiro no SQL Editor.
-- 3. No final deste arquivo, descomente o INSERT e cole o UUID e o e-mail.
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Lista de administradores autorizados
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;

-- 2. Função usada nas políticas de RLS.
--    SECURITY DEFINER permite consultar admin_users sem liberar a tabela.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 3. Catálogo: leitura pública apenas de itens ativos; escrita só para admin
grant usage on schema public to anon, authenticated;
grant select on public.quadros to anon, authenticated;
grant insert, update, delete on public.quadros to authenticated;
alter table public.quadros enable row level security;

drop policy if exists "Visitantes visualizam quadros ativos" on public.quadros;
create policy "Visitantes visualizam quadros ativos"
  on public.quadros
  for select
  to anon
  using (ativo = true);

drop policy if exists "Admin visualiza todos os quadros" on public.quadros;
create policy "Admin visualiza todos os quadros"
  on public.quadros
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin cadastra quadros" on public.quadros;
create policy "Admin cadastra quadros"
  on public.quadros
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin atualiza quadros" on public.quadros;
create policy "Admin atualiza quadros"
  on public.quadros
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin exclui quadros" on public.quadros;
create policy "Admin exclui quadros"
  on public.quadros
  for delete
  to authenticated
  using (public.is_admin());

-- 4. Storage: leitura pública; upload/edição/exclusão só para admin
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
    and public.is_admin()
  );

drop policy if exists "Admin atualiza imagens de quadros" on storage.objects;
create policy "Admin atualiza imagens de quadros"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'quadros-imagens'
    and public.is_admin()
  )
  with check (
    bucket_id = 'quadros-imagens'
    and public.is_admin()
  );

drop policy if exists "Admin remove imagens de quadros" on storage.objects;
create policy "Admin remove imagens de quadros"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'quadros-imagens'
    and public.is_admin()
  );

-- 5. AUDITORIA (opcional)
-- Se você criou políticas manualmente no passado, confira se alguma ainda
-- permite escrita para `anon` ou para qualquer autenticado:
--
-- select schemaname, tablename, policyname, cmd, roles, qual, with_check
-- from pg_policies
-- where schemaname in ('public', 'storage')
--   and tablename in ('quadros', 'objects')
-- order by schemaname, tablename, policyname;
-- ============================================================================

-- ============================================================================
-- 6. ADICIONE SEU ADMINISTRADOR
-- ----------------------------------------------------------------------------
-- Substitua os valores abaixo pelo UUID e e-mail do usuário criado em
-- Authentication > Users e execute apenas este INSERT:
--
-- insert into public.admin_users (user_id, email)
-- values ('00000000-0000-0000-0000-000000000000', 'seu-email@exemplo.com')
-- on conflict (user_id) do nothing;
--
-- Para conferir quem está autorizado:
-- select au.user_id, au.email, u.email as auth_email
-- from public.admin_users au
-- left join auth.users u on u.id = au.user_id;
-- ============================================================================
