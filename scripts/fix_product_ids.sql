-- Fix products.id and product_media.product_id to accept non-UUID text ids from admin panel

-- 1. Drop view first because it uses products.id
drop view if exists vw_published_products;

-- 2. Drop RLS policies that reference the columns
drop policy if exists "public_select_published_media" on product_media;
drop policy if exists "authenticated_manage_product_media" on product_media;
drop policy if exists "public_select_published_products" on products;
drop policy if exists "authenticated_manage_products" on products;

-- 3. Drop FK constraint that blocks type change
alter table product_media drop constraint if exists product_media_product_id_fkey;

-- 4. Alter products.id to TEXT
ALTER TABLE products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE products ALTER COLUMN id TYPE TEXT USING id::text;

-- 5. product_media references products(id) — must also accept text
ALTER TABLE product_media ALTER COLUMN product_id TYPE TEXT USING product_id::text;

-- 6. Re-add a default generator so new rows still get an id
ALTER TABLE products ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- 7. Re-add FK constraint on text product_id
alter table product_media add constraint product_media_product_id_fkey
foreign key (product_id) references products(id) on delete cascade;

-- 8. Re-create the view after type change
create or replace view vw_published_products as
select
  p.*,
  c.name as category_name,
  sc.name as subcategory_name
from products p
left join categories c on c.id = p.category_id
left join categories sc on sc.id = p.subcategory_id
where p.is_published = true and p.is_hidden = false;

-- 9. Re-apply RLS policies
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