-- ============================================================================
-- TapRD - Esquema completo para Supabase (PostgreSQL + RLS + Storage)
-- Pega y ejecuta este archivo una sola vez en:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

-- Extensiones útiles
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. TABLA: clients (Perfiles comerciales NFC y datos del negocio)
-- ============================================================================
create table if not exists public.clients (
  id text primary key,
  slug text unique not null,
  business_name text not null,
  owner_name text,
  category text,
  description text,
  phone text,
  whatsapp text,
  email text,
  client_email text,
  city text,
  address text,
  product_assigned text default 'Tap Card',
  status text default 'active',
  profile_status text default 'active',
  active boolean default true,
  views integer default 0,
  plan text default 'starter',
  subscription_status text default 'active',
  access_status text default 'none',
  user_id text,
  logo_url text,
  cover_gradient text,
  avatar_bg_color text,
  avatar_initials text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_clients_slug on public.clients (lower(slug));
create index if not exists idx_clients_status on public.clients (status);
create index if not exists idx_clients_user_id on public.clients (user_id);

-- ============================================================================
-- 2. TABLA: quote_requests (Solicitudes de cotización / Leads)
-- ============================================================================
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'contact_form',
  name text not null,
  business_name text default '',
  phone text default '',
  email text default '',
  business_type text default '',
  product_interest text default 'Tap Card',
  quantity integer default 1,
  city text default '',
  need_option text default '',
  message text default '',
  status text not null default 'new',
  admin_notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_quote_requests_created_at on public.quote_requests (created_at desc);
create index if not exists idx_quote_requests_status on public.quote_requests (status);

-- ============================================================================
-- 3. TABLA: analytics_events (Eventos de visitas, escaneos NFC/QR y clics)
-- ============================================================================
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references public.clients(id) on delete cascade,
  type text not null,
  device text not null default 'desktop',
  source text,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_client_created on public.analytics_events (client_id, created_at desc);

-- ============================================================================
-- 4. TABLA: plans (Catálogo de planes SaaS)
-- ============================================================================
create table if not exists public.plans (
  id text primary key,
  name text not null,
  price numeric default 0,
  currency text default 'DOP',
  billing_cycle text default 'monthly',
  active boolean default true,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 5. TABLA: reports (Reportes de abuso / moderación)
-- ============================================================================
create table if not exists public.reports (
  id text primary key,
  profile_slug text not null,
  client_id text not null,
  business_name text,
  reason text not null,
  details text,
  reporter_email text,
  status text default 'pending',
  action_taken text default 'none',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 6. TABLA: privacy_requests (Solicitudes ARCO)
-- ============================================================================
create table if not exists public.privacy_requests (
  id text primary key,
  user_id text not null,
  client_id text,
  request_type text not null,
  details text,
  status text default 'pending',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 7. TABLA: system_settings (Configuración global)
-- ============================================================================
create table if not exists public.system_settings (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 8. FUNCIÓN RPC: Incrementar vistas de forma atómica
-- ============================================================================
create or replace function public.increment_client_views(target_client_id text)
returns void
language plpgsql
security definer
as $$
begin
  update public.clients
  set views = coalesce(views, 0) + 1,
      data = jsonb_set(coalesce(data, '{}'::jsonb), '{views}', to_jsonb(coalesce(views, 0) + 1)),
      updated_at = now()
  where id = target_client_id;
end;
$$;

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================================================
alter table public.clients enable row level security;
alter table public.quote_requests enable row level security;
alter table public.analytics_events enable row level security;
alter table public.plans enable row level security;
alter table public.reports enable row level security;
alter table public.privacy_requests enable row level security;
alter table public.system_settings enable row level security;

-- Lectura pública de perfiles comerciales y planes
drop policy if exists "Public read clients" on public.clients;
create policy "Public read clients" on public.clients for select using (true);

drop policy if exists "Public write clients" on public.clients;
create policy "Public write clients" on public.clients for all using (true) with check (true);

drop policy if exists "Public read plans" on public.plans;
create policy "Public read plans" on public.plans for select using (true);

drop policy if exists "Public write plans" on public.plans;
create policy "Public write plans" on public.plans for all using (true) with check (true);

-- Solicitudes de cotización: inserción pública y gestión abierta para panel Admin
drop policy if exists "Public insert quotes" on public.quote_requests;
create policy "Public insert quotes" on public.quote_requests for insert with check (true);

drop policy if exists "Read quotes" on public.quote_requests;
create policy "Read quotes" on public.quote_requests for select using (true);

drop policy if exists "Update quotes" on public.quote_requests;
create policy "Update quotes" on public.quote_requests for update using (true) with check (true);

drop policy if exists "Delete quotes" on public.quote_requests;
create policy "Delete quotes" on public.quote_requests for delete using (true);

-- Eventos de analytics
drop policy if exists "Public insert analytics" on public.analytics_events;
create policy "Public insert analytics" on public.analytics_events for insert with check (true);

drop policy if exists "Read analytics" on public.analytics_events;
create policy "Read analytics" on public.analytics_events for select using (true);

-- Reportes, Privacidad y Settings
drop policy if exists "Public reports access" on public.reports;
create policy "Public reports access" on public.reports for all using (true) with check (true);

drop policy if exists "Public privacy access" on public.privacy_requests;
create policy "Public privacy access" on public.privacy_requests for all using (true) with check (true);

drop policy if exists "Public settings access" on public.system_settings;
create policy "Public settings access" on public.system_settings for all using (true) with check (true);

-- ============================================================================
-- 10. STORAGE BUCKET: taprd-media (Logos, avatares y galerías)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('taprd-media', 'taprd-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read taprd-media" on storage.objects;
create policy "Public read taprd-media"
  on storage.objects for select
  using (bucket_id = 'taprd-media');

drop policy if exists "Public upload taprd-media" on storage.objects;
create policy "Public upload taprd-media"
  on storage.objects for insert
  with check (bucket_id = 'taprd-media');

drop policy if exists "Public update taprd-media" on storage.objects;
create policy "Public update taprd-media"
  on storage.objects for update
  using (bucket_id = 'taprd-media');

drop policy if exists "Public delete taprd-media" on storage.objects;
create policy "Public delete taprd-media"
  on storage.objects for delete
  using (bucket_id = 'taprd-media');
