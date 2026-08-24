-- ============================================================
-- WeMakeApps - Initial Database Schema
-- ============================================================

-- ------------------------------------------------------------
-- Profiles
-- Extends Supabase Auth users.
-- ------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ------------------------------------------------------------
-- Businesses
-- A user can eventually own/manage one or more businesses.
-- ------------------------------------------------------------

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,

  name text not null,
  tagline text,
  description text,

  phone text,
  whatsapp text,
  email text,

  address_line_1 text,
  address_line_2 text,
  city text,
  province text,
  postal_code text,
  country text default 'South Africa',

  opening_hours jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ------------------------------------------------------------
-- Apps
-- The central configuration for a business's mobile app.
-- ------------------------------------------------------------

create table public.apps (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,

  name text not null,
  status text not null default 'draft'
    check (status in ('draft', 'ready', 'live', 'suspended')),

  theme jsonb not null default '{}'::jsonb,
  navigation jsonb not null default '[]'::jsonb,
  features jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ------------------------------------------------------------
-- App Pages
-- Flexible page definitions used by the builder/simulator.
-- ------------------------------------------------------------

create table public.app_pages (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,

  slug text not null,
  title text not null,
  type text not null,

  sort_order integer not null default 0,
  is_enabled boolean not null default true,

  sections jsonb not null default '[]'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (app_id, slug)
);


-- ------------------------------------------------------------
-- App Services
-- Services/products displayed by the business.
-- ------------------------------------------------------------

create table public.app_services (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,

  name text not null,
  description text,

  price numeric(12,2),
  currency text not null default 'ZAR',

  image_url text,

  sort_order integer not null default 0,
  is_enabled boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ------------------------------------------------------------
-- App Media
-- Images/files associated with an app.
-- Actual files will live in Supabase Storage.
-- ------------------------------------------------------------

create table public.app_media (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,

  type text not null
    check (type in ('logo', 'cover', 'gallery', 'service', 'other')),

  file_path text not null,
  file_name text,

  alt_text text,

  sort_order integer not null default 0,

  created_at timestamptz not null default now()
);


-- ============================================================
-- Indexes
-- ============================================================

create index businesses_owner_id_idx
  on public.businesses(owner_id);

create index apps_business_id_idx
  on public.apps(business_id);

create index app_pages_app_id_idx
  on public.app_pages(app_id);

create index app_services_app_id_idx
  on public.app_services(app_id);

create index app_media_app_id_idx
  on public.app_media(app_id);


-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.apps enable row level security;
alter table public.app_pages enable row level security;
alter table public.app_services enable row level security;
alter table public.app_media enable row level security;


-- ------------------------------------------------------------
-- Profiles policies
-- ------------------------------------------------------------

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());


-- ------------------------------------------------------------
-- Businesses policies
-- ------------------------------------------------------------

create policy "Users can view their own businesses"
on public.businesses
for select
to authenticated
using (owner_id = auth.uid());

create policy "Users can create their own businesses"
on public.businesses
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Users can update their own businesses"
on public.businesses
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Users can delete their own businesses"
on public.businesses
for delete
to authenticated
using (owner_id = auth.uid());


-- ------------------------------------------------------------
-- Apps policies
-- ------------------------------------------------------------

create policy "Users can view their own apps"
on public.apps
for select
to authenticated
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = apps.business_id
      and businesses.owner_id = auth.uid()
  )
);

create policy "Users can create apps for their businesses"
on public.apps
for insert
to authenticated
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = apps.business_id
      and businesses.owner_id = auth.uid()
  )
);

create policy "Users can update their own apps"
on public.apps
for update
to authenticated
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = apps.business_id
      and businesses.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = apps.business_id
      and businesses.owner_id = auth.uid()
  )
);

create policy "Users can delete their own apps"
on public.apps
for delete
to authenticated
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = apps.business_id
      and businesses.owner_id = auth.uid()
  )
);


-- ------------------------------------------------------------
-- App Pages policies
-- ------------------------------------------------------------

create policy "Users can manage pages for their own apps"
on public.app_pages
for all
to authenticated
using (
  exists (
    select 1
    from public.apps
    join public.businesses
      on businesses.id = apps.business_id
    where apps.id = app_pages.app_id
      and businesses.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.apps
    join public.businesses
      on businesses.id = apps.business_id
    where apps.id = app_pages.app_id
      and businesses.owner_id = auth.uid()
  )
);


-- ------------------------------------------------------------
-- App Services policies
-- ------------------------------------------------------------

create policy "Users can manage services for their own apps"
on public.app_services
for all
to authenticated
using (
  exists (
    select 1
    from public.apps
    join public.businesses
      on businesses.id = apps.business_id
    where apps.id = app_services.app_id
      and businesses.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.apps
    join public.businesses
      on businesses.id = apps.business_id
    where apps.id = app_services.app_id
      and businesses.owner_id = auth.uid()
  )
);


-- ------------------------------------------------------------
-- App Media policies
-- ------------------------------------------------------------

create policy "Users can manage media for their own apps"
on public.app_media
for all
to authenticated
using (
  exists (
    select 1
    from public.apps
    join public.businesses
      on businesses.id = apps.business_id
    where apps.id = app_media.app_id
      and businesses.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.apps
    join public.businesses
      on businesses.id = apps.business_id
    where apps.id = app_media.app_id
      and businesses.owner_id = auth.uid()
  )
);


-- ============================================================
-- Automatically create a profile when a user signs up
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);

  return new;
end;
$$;


create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();