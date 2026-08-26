-- Supabase / PostgreSQL migration for CatKapi website
-- Run this in Supabase SQL editor or via psql with a database admin role.

create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  parent_id uuid references categories(id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  product_code text,
  description text,
  material text,
  dimensions_text text,
  category_id uuid references categories(id) on delete set null,
  subcategory_id uuid references categories(id) on delete set null,
  price numeric(12,2) not null default 0,
  campaign_price numeric(12,2),
  price_display_mode text not null default 'numeric' check (price_display_mode in ('numeric', 'ask_price', 'get_quote')),
  is_campaign boolean not null default false,
  is_new boolean not null default false,
  is_published boolean not null default false,
  is_hidden boolean not null default false,
  cover_image_index integer not null default 0,
  stock_status text not null default 'Sipariş Üzerine Üretiliyor',
  brand text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_media (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references products(id) on delete cascade,
  media_url text not null,
  media_type text not null default 'image',
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  salt text not null,
  hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists admin_sessions (
  token text primary key,
  username text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists site_settings (
  id integer primary key default 1,
  settings_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_categories_updated_at on categories;
create trigger trg_categories_updated_at
before update on categories
for each row execute function set_updated_at();

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
before update on products
for each row execute function set_updated_at();

create index if not exists idx_categories_parent_id on categories(parent_id);
create index if not exists idx_categories_active on categories(is_active);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_subcategory on products(subcategory_id);
create index if not exists idx_products_published on products(is_published, is_hidden);
create index if not exists idx_product_media_product on product_media(product_id, sort_order);

create or replace view vw_published_products as
select
  p.*,
  c.name as category_name,
  sc.name as subcategory_name
from products p
left join categories c on c.id = p.category_id
left join categories sc on sc.id = p.subcategory_id
where p.is_published = true and p.is_hidden = false;
