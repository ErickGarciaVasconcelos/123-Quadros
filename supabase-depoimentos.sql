-- ============================================================================
-- 123quadro — DEPOIMENTOS / ELOGIOS EDITÁVEIS PELO PAINEL ADMINISTRATIVO
-- ----------------------------------------------------------------------------
-- Execute este script no SQL Editor do Supabase para habilitar a gestão dos
-- depoimentos no painel administrativo.
--
-- O script é idempotente: pode ser executado mais de uma vez sem duplicar
-- a tabela nem os depoimentos iniciais.
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Lista de administradores autorizados (necessária para as políticas)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;

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

-- 2. Tabela de depoimentos
create table if not exists public.depoimentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cidade text not null default '',
  texto text not null,
  iniciais text not null default '',
  estrelas integer not null default 5 check (estrelas >= 1 and estrelas <= 5),
  ativo boolean not null default true,
  ordem integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Índice para a vitrine
create index if not exists idx_depoimentos_vitrine
  on public.depoimentos (ativo, ordem asc, created_at desc);

-- 4. Trigger de updated_at
create or replace function public.set_depoimentos_updated_at()
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

drop trigger if exists trg_depoimentos_updated_at on public.depoimentos;
create trigger trg_depoimentos_updated_at
before update on public.depoimentos
for each row
execute function public.set_depoimentos_updated_at();

-- 5. Permissões e Row Level Security
grant usage on schema public to anon, authenticated;
grant select on public.depoimentos to anon, authenticated;
grant insert, update, delete on public.depoimentos to authenticated;

alter table public.depoimentos enable row level security;

drop policy if exists "Visitantes visualizam depoimentos ativos" on public.depoimentos;
create policy "Visitantes visualizam depoimentos ativos"
  on public.depoimentos
  for select
  to anon
  using (ativo = true);

drop policy if exists "Admin visualiza todos os depoimentos" on public.depoimentos;
create policy "Admin visualiza todos os depoimentos"
  on public.depoimentos
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin cadastra depoimentos" on public.depoimentos;
create policy "Admin cadastra depoimentos"
  on public.depoimentos
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin atualiza depoimentos" on public.depoimentos;
create policy "Admin atualiza depoimentos"
  on public.depoimentos
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin exclui depoimentos" on public.depoimentos;
create policy "Admin exclui depoimentos"
  on public.depoimentos
  for delete
  to authenticated
  using (public.is_admin());

-- 6. Carga inicial (somente se a tabela estiver vazia)
insert into public.depoimentos (nome, cidade, texto, iniciais, estrelas, ativo, ordem)
select * from (values
  (
    'Mariana C.',
    'São Paulo',
    'Comprei três obras para a sala e parece outra casa. A qualidade da moldura e o cuidado na embalagem me surpreenderam de verdade.',
    'MC',
    5,
    true,
    1
  ),
  (
    'João Pedro L.',
    'Curitiba',
    'A escolha dos quadros acertou em cheio. Eu queria renovar a sala e consegui montar uma parede incrível dentro do meu orçamento.',
    'JP',
    5,
    true,
    2
  ),
  (
    'Dra. Ana L.',
    'Belo Horizonte',
    'Comprei para o consultório e a recepção virou ponto de elogio. As cores pessoalmente são ainda mais vivas do que nas fotos.',
    'AL',
    5,
    true,
    3
  )
) as v(nome, cidade, texto, iniciais, estrelas, ativo, ordem)
where not exists (select 1 from public.depoimentos limit 1);

-- ============================================================================
-- 7. ADICIONE SEU ADMINISTRADOR (caso ainda não exista)
-- ----------------------------------------------------------------------------
-- Crie o usuário em Authentication > Users, copie o UUID e execute:
--
-- insert into public.admin_users (user_id, email)
-- values ('00000000-0000-0000-0000-000000000000', 'seu-email@exemplo.com')
-- on conflict (user_id) do nothing;
-- ============================================================================
