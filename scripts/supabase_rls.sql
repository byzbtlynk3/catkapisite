-- Row Level Security policies for CatKapi

alter table if exists categories enable row level security;
alter table if exists products enable row level security;
alter table if exists product_media enable row level security;
alter table if exists admins enable row level security;
alter table if exists admin_sessions enable row level security;

drop policy if exists "public_select_categories" on categories;
create policy "public_select_categories" on categories
for select
to public
using (is_active = true);

drop policy if exists "public_select_published_products" on products;
create policy "public_select_published_products" on products
for select
to public
using (is_published = true and is_hidden = false);

drop policy if exists "public_select_published_media" on product_media;
create policy "public_select_published_media" on product_media
for select
to public
using (
  exists (
    select 1 from products p
    where p.id = product_media.product_id
      and p.is_published = true
      and p.is_hidden = false
  )
);

drop policy if exists "authenticated_manage_categories" on categories;
create policy "authenticated_manage_categories" on categories
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_manage_products" on products;
create policy "authenticated_manage_products" on products
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_manage_product_media" on product_media;
create policy "authenticated_manage_product_media" on product_media
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_manage_admins" on admins;
create policy "authenticated_manage_admins" on admins
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_manage_admin_sessions" on admin_sessions;
create policy "authenticated_manage_admin_sessions" on admin_sessions
for all
to authenticated
using (true)
with check (true);
