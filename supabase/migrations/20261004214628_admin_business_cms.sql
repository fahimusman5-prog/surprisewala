-- Surprisewala additive business CMS. Target: pzjbfhwzaettkzaxjdte ONLY.
-- Review live schema, policies, Auth and Storage before applying. Does not reset data.
-- Existing membership/booking migrations must already have been applied.
begin;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete restrict,
  display_name text not null default '' check (length(display_name) <= 160),
  email text not null unique,
  role text not null check (role in ('super_admin','admin','editor')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null check (length(full_name) between 2 and 160),
  phone text not null check (length(phone) between 7 and 40),
  normalized_phone text not null,
  admin_notes text check (length(admin_notes) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120),
  short_description text not null default '' check (length(short_description) <= 1000),
  cover_image text,
  active boolean not null default true,
  featured boolean not null default false,
  display_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.packages (
  id text primary key check (length(id) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120),
  name text not null check (length(name) between 1 and 200),
  badge text not null default '' check (length(badge) <= 80),
  description text not null default '' check (length(description) <= 10000),
  price numeric(12,2) check (price >= 0),
  price_note text not null default '' check (length(price_note) <= 1000),
  main_image text,
  video_url text,
  video_orientation text not null default 'portrait' check (video_orientation in ('portrait','landscape')),
  order_mode text not null default 'cart' check (order_mode in ('cart','enquiry','cake')),
  active boolean not null default true,
  featured boolean not null default false,
  display_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint packages_pricing_mode check ((order_mode = 'cart' and price is not null) or (order_mode in ('enquiry','cake') and price is null))
);
create table if not exists public.package_collections (
  package_id text not null references public.packages(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete restrict,
  primary key (package_id, collection_id)
);
create table if not exists public.package_items (
  id uuid primary key default gen_random_uuid(),
  package_id text not null references public.packages(id) on delete cascade,
  label text not null check (length(label) between 1 and 500),
  display_order integer not null default 0
);
create table if not exists public.package_images (
  id uuid primary key default gen_random_uuid(),
  package_id text not null references public.packages(id) on delete cascade,
  image_path text not null,
  alt_text text not null default '' check (length(alt_text) <= 300),
  display_order integer not null default 0
);
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,
  media_type text not null default 'image' check (media_type in ('image','video')),
  title text not null default '' check (length(title) <= 200),
  caption text not null default '' check (length(caption) <= 2000),
  active boolean not null default true,
  featured boolean not null default false,
  display_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (length(customer_name) between 1 and 160),
  review text not null check (length(review) between 1 and 5000),
  rating integer check (rating between 1 and 5),
  customer_image text,
  package_id text references public.packages(id) on delete set null,
  published boolean not null default false,
  featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.site_statistics (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key in ('surprises_delivered','countries_active')),
  label text not null check (length(label) between 1 and 100),
  value numeric(12,2) not null check (value >= 0),
  suffix text not null default '' check (length(suffix) <= 10),
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.site_settings (
  key text primary key check (key in ('phone','whatsapp','instagram','facebook','tiktok','google_review_url','cms_enabled')),
  value text not null check (length(value) <= 2000),
  updated_at timestamptz not null default now()
);
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  path text not null unique check (path ~ '^(packages|collections|gallery|reviews)/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$'),
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp')),
  size bigint not null check (size between 1 and 8388608),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.admin_users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.orders alter column user_id drop not null;
-- Keep orders if an Auth account is legitimately removed.
alter table public.orders drop constraint if exists orders_user_id_fkey;
alter table public.orders add constraint orders_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null;
alter table public.orders add column if not exists customer_id uuid references public.customers(id) on delete restrict;
alter table public.orders add column if not exists order_reference text;
alter table public.orders add column if not exists admin_notes text check (length(admin_notes) <= 4000);
alter table public.orders add column if not exists updated_at timestamptz not null default now();
alter table public.orders add column if not exists submission_key uuid;
create sequence if not exists private.order_reference_seq;
revoke all on sequence private.order_reference_seq from public, anon, authenticated;
create unique index if not exists orders_order_reference_idx on public.orders(order_reference) where order_reference is not null;
create unique index if not exists orders_submission_key_idx on public.orders(submission_key) where submission_key is not null;
create index if not exists orders_upcoming_idx on public.orders(surprise_date, surprise_time) where coalesce(order_status, status) not in ('completed','cancelled');
create index if not exists orders_customer_created_idx on public.orders(customer_id, created_at desc);
create index if not exists orders_package_idx on public.orders(package_id);
create index if not exists orders_status_created_idx on public.orders(order_status, created_at desc);
create index if not exists customers_phone_idx on public.customers(normalized_phone);
create index if not exists customers_created_idx on public.customers(created_at desc);
create index if not exists package_collections_collection_idx on public.package_collections(collection_id, package_id);
create index if not exists package_items_package_idx on public.package_items(package_id, display_order);
create index if not exists package_images_package_idx on public.package_images(package_id, display_order);
create index if not exists packages_public_idx on public.packages(display_order) where active and archived_at is null;
create index if not exists collections_public_idx on public.collections(display_order) where active and archived_at is null;
create index if not exists gallery_public_idx on public.gallery_items(display_order) where active and archived_at is null;
create index if not exists reviews_public_idx on public.reviews(display_order) where published;
create index if not exists reviews_package_idx on public.reviews(package_id);
create index if not exists media_created_by_idx on public.media_assets(created_by);
create index if not exists activity_created_idx on public.admin_activity_logs(created_at desc);
create index if not exists activity_actor_idx on public.admin_activity_logs(admin_user_id);

create or replace function private.current_admin_role() returns text
language sql stable security definer set search_path = '' as $$
  select role from public.admin_users where id = (select auth.uid()) and active;
$$;
create or replace function private.has_permission(p_module text) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(case private.current_admin_role()
    when 'super_admin' then true
    when 'admin' then p_module in ('dashboard','orders','customers','packages','collections','gallery','reviews','content','media','settings','profile')
    when 'editor' then p_module in ('dashboard','packages','collections','gallery','reviews','media','profile')
    else false end, false);
$$;
revoke all on function private.current_admin_role(), private.has_permission(text) from public;
grant execute on function private.current_admin_role(), private.has_permission(text) to anon, authenticated;

create or replace function private.normalize_phone(p_phone text) returns text
language sql immutable set search_path = '' as $$
  select case when regexp_replace(p_phone, '[^0-9]', '', 'g') ~ '^0[0-9]{9}$'
    then '94' || substring(regexp_replace(p_phone, '[^0-9]', '', 'g') from 2)
    else regexp_replace(p_phone, '[^0-9]', '', 'g') end;
$$;
revoke all on function private.normalize_phone(text) from public;

-- A narrow definer lookup prevents cyclic RLS between packages and associations.
create or replace function private.package_is_public(p_id text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.packages p
    join public.package_collections pc on pc.package_id=p.id
    join public.collections c on c.id=pc.collection_id
    where p.id=p_id and p.active and p.archived_at is null and c.active and c.archived_at is null);
$$;
revoke all on function private.package_is_public(text) from public;
grant execute on function private.package_is_public(text) to anon,authenticated;

create or replace function private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;
revoke all on function private.touch_updated_at() from public;
do $$ declare t text; begin
  foreach t in array array['admin_users','customers','collections','packages','gallery_items','reviews','site_statistics','site_settings','profiles','orders'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function private.touch_updated_at()', t);
  end loop;
end $$;

-- Both identity and authorization come from Auth/database rows, never user metadata.
create or replace function private.protect_admin_users() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_email text; v_bootstrap boolean;
begin
  perform pg_advisory_xact_lock(hashtext('surprisewala-admin-role-changes'));
  v_bootstrap := auth.uid() is null and session_user in ('postgres','supabase_admin');
  if not v_bootstrap and not private.has_permission('admins') then
    -- The profile RPC may change only the actor's display name.
    if tg_op <> 'UPDATE' or old.id <> auth.uid()
      or (to_jsonb(new) - array['display_name','updated_at']) is distinct from (to_jsonb(old) - array['display_name','updated_at']) then
      raise exception 'Super Admin permission required' using errcode = '42501';
    end if;
  end if;
  if tg_op <> 'DELETE' then
    select email into v_email from auth.users where id = new.id;
    if v_email is null or lower(new.email) <> lower(v_email) then
      raise exception 'Admin must be associated with a real Auth account' using errcode = '23514';
    end if;
    if tg_op = 'UPDATE' and (new.id is distinct from old.id or new.email is distinct from old.email) then
      raise exception 'Admin identity cannot be changed' using errcode = '23514';
    end if;
  end if;
  if tg_op in ('UPDATE','DELETE') then
    if lower(old.email) = 'fahimusman5@gmail.com' and (tg_op = 'DELETE' or new.role <> 'super_admin' or not new.active) then
      raise exception 'The primary Super Admin must remain active' using errcode = '23514';
    end if;
    if old.role = 'super_admin' and old.active and (tg_op = 'DELETE' or new.role <> 'super_admin' or not new.active)
      and not exists (select 1 from public.admin_users where role = 'super_admin' and active and id <> old.id) then
      raise exception 'The final active Super Admin cannot be removed' using errcode = '23514';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end; $$;
revoke all on function private.protect_admin_users() from public;
drop trigger if exists protect_admin_role_changes on public.admin_users;
create trigger protect_admin_role_changes before insert or update or delete on public.admin_users for each row execute function private.protect_admin_users();

-- Provision only an existing genuine Auth account. If absent, onboarding is documented.
insert into public.admin_users (id, display_name, email, role, active)
select id, coalesce(raw_user_meta_data ->> 'full_name','Super Admin'), email, 'super_admin', true
from auth.users where lower(email) = 'fahimusman5@gmail.com'
on conflict (id) do update set role = 'super_admin', active = true;

-- Authenticated customer identity is deduplicated only by verified Auth user ID.
insert into public.customers (user_id, full_name, phone, normalized_phone, created_at)
select distinct on (o.user_id) o.user_id,
  left(coalesce(nullif(o.customer_name,''), nullif(p.full_name,''),'Customer'),160),
  coalesce(nullif(o.customer_phone,''),nullif(p.phone,''),'Not provided'),
  private.normalize_phone(coalesce(o.customer_phone,p.phone,'')), o.created_at
from public.orders o left join public.profiles p on p.id = o.user_id
where o.user_id is not null order by o.user_id, o.created_at desc
on conflict (user_id) do nothing;
update public.orders o set customer_id = c.id from public.customers c where o.user_id = c.user_id and o.customer_id is null;
update public.orders set order_reference = 'SW-' || to_char(created_at at time zone 'Asia/Colombo','YYYY') || '-' || lpad(nextval('private.order_reference_seq')::text,6,'0') where order_reference is null;

create or replace function private.protect_order_history() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (to_jsonb(new) - array['status','order_status','payment_status','admin_notes','updated_at'])
      is distinct from (to_jsonb(old) - array['status','order_status','payment_status','admin_notes','updated_at']) then
    raise exception 'Historical booking details and prices are immutable' using errcode = '23514';
  end if;
  if new.order_status is distinct from old.order_status then new.status := new.order_status;
  elsif new.status is distinct from old.status then new.order_status := new.status;
  end if;
  if coalesce(new.order_status,new.status) not in ('pending','new','contacted','confirmed','preparing','scheduled','completed','cancelled') then
    raise exception 'Invalid order status' using errcode = '23514';
  end if;
  if new.payment_status not in ('pending','unpaid','partially_paid','paid','refunded','cancelled') then
    raise exception 'Invalid payment status' using errcode = '23514';
  end if;
  return new;
end; $$;
revoke all on function private.protect_order_history() from public;
drop trigger if exists protect_order_history on public.orders;
create trigger protect_order_history before update on public.orders for each row execute function private.protect_order_history();

create or replace function private.protect_business_settings() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_bootstrap boolean; begin
  v_bootstrap := auth.uid() is null and session_user in ('postgres','supabase_admin');
  if coalesce(new.key,old.key) = 'cms_enabled' then
    if not v_bootstrap and private.current_admin_role() is distinct from 'super_admin' then
      raise exception 'Only Super Admin can activate the CMS' using errcode = '42501';
    end if;
    if tg_op = 'DELETE' or (tg_op = 'UPDATE' and old.value = 'true' and new.value <> 'true') then
      raise exception 'CMS activation cannot be reversed to legacy data' using errcode = '23514';
    end if;
    if new.value not in ('true','false') then raise exception 'Invalid CMS activation setting' using errcode = '23514'; end if;
  elsif tg_op <> 'DELETE' then
    if new.key in ('instagram','facebook','tiktok','google_review_url') and new.value <> '' and new.value !~ '^https://[^[:space:]]+$' then
      raise exception 'Use an HTTPS social or review URL' using errcode = '23514';
    end if;
    if new.key in ('phone','whatsapp') and new.value !~ '^\+?[0-9 ()-]{7,40}$' then
      raise exception 'Invalid business phone number' using errcode = '23514';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if; return new;
end; $$;
revoke all on function private.protect_business_settings() from public;
drop trigger if exists protect_business_settings on public.site_settings;
create trigger protect_business_settings before insert or update or delete on public.site_settings for each row execute function private.protect_business_settings();
insert into public.site_settings(key,value) values ('cms_enabled','false') on conflict (key) do nothing;

create or replace function private.log_admin_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_id text; v_changes jsonb := '{}'::jsonb; v_action text; begin
  if auth.uid() is null or private.current_admin_role() is null then
    if tg_op = 'DELETE' then return old; end if; return new;
  end if;
  v_id := coalesce(to_jsonb(new)->>'id',to_jsonb(old)->>'id',to_jsonb(new)->>'key',to_jsonb(old)->>'key');
  v_action := lower(tg_op);
  if tg_op = 'UPDATE' then
    select jsonb_build_object('changed_fields',coalesce(jsonb_agg(k),'[]'::jsonb)) into v_changes
    from jsonb_object_keys(to_jsonb(new)) as keys(k)
    where k <> 'updated_at' and to_jsonb(new)->k is distinct from to_jsonb(old)->k;
    if v_changes->'changed_fields' = '[]'::jsonb then return new; end if;
    if tg_table_name = 'orders' then
      if new.order_status is distinct from old.order_status then
        v_action := 'status_changed'; v_changes := jsonb_build_object('previous_status',old.order_status,'status',new.order_status);
      end if;
    end if;
  end if;
  insert into public.admin_activity_logs(admin_user_id,action,entity_type,entity_id,metadata)
  values (auth.uid(),v_action,tg_table_name,v_id,v_changes);
  if tg_op = 'DELETE' then return old; end if; return new;
end; $$;
revoke all on function private.log_admin_change() from public;
do $$ declare t text; begin
  foreach t in array array['admin_users','customers','orders','packages','collections','gallery_items','reviews','site_statistics','site_settings','media_assets'] loop
    execute format('drop trigger if exists log_admin_change on public.%I', t);
    execute format('create trigger log_admin_change after insert or update or delete on public.%I for each row execute function private.log_admin_change()', t);
  end loop;
end $$;

create or replace function private.media_in_use(p_path text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.packages where main_image like '%' || p_path or video_url like '%' || p_path)
    or exists (select 1 from public.package_images where image_path like '%' || p_path)
    or exists (select 1 from public.collections where cover_image like '%' || p_path)
    or exists (select 1 from public.gallery_items where image_path like '%' || p_path)
    or exists (select 1 from public.reviews where customer_image like '%' || p_path);
$$;
revoke all on function private.media_in_use(text) from public;
grant execute on function private.media_in_use(text) to authenticated;
create or replace function private.protect_media_deletion() returns trigger
language plpgsql security definer set search_path = '' as $$ begin
  if private.media_in_use(old.path) then raise exception 'This image is still used by business content' using errcode = '23514'; end if;
  return old;
end; $$;
revoke all on function private.protect_media_deletion() from public;
drop trigger if exists protect_media_deletion on public.media_assets;
create trigger protect_media_deletion before delete on public.media_assets for each row execute function private.protect_media_deletion();

-- Package/collection hard deletion is denied while historical order data references it.
create or replace function private.protect_catalog_deletion() returns trigger
language plpgsql security definer set search_path = '' as $$ begin
  if tg_table_name = 'packages' then
    if exists (select 1 from public.orders where package_id = old.id or items @> jsonb_build_array(jsonb_build_object('id',old.id))) then
      raise exception 'Archive packages with historical orders' using errcode = '23514';
    end if;
  elsif tg_table_name = 'collections' then
    if exists (select 1 from public.package_collections where collection_id = old.id) then
      raise exception 'Archive collections referenced by packages' using errcode = '23514';
    end if;
  end if;
  return old;
end; $$;
revoke all on function private.protect_catalog_deletion() from public;
drop trigger if exists protect_catalog_deletion on public.packages;
create trigger protect_catalog_deletion before delete on public.packages for each row execute function private.protect_catalog_deletion();
drop trigger if exists protect_catalog_deletion on public.collections;
create trigger protect_catalog_deletion before delete on public.collections for each row execute function private.protect_catalog_deletion();

-- RLS and grants are explicit; anon can read published business data only.
do $$ declare t text; begin
  foreach t in array array['admin_users','customers','collections','packages','package_collections','package_items','package_images','gallery_items','reviews','site_statistics','site_settings','media_assets','admin_activity_logs'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;
grant select on public.collections,public.packages,public.package_collections,public.package_items,public.package_images,public.gallery_items,public.reviews,public.site_statistics,public.site_settings to anon,authenticated;
grant insert,update,delete on public.collections,public.packages,public.package_collections,public.package_items,public.package_images,public.gallery_items,public.reviews,public.site_statistics,public.site_settings to authenticated;
grant select,insert,update on public.admin_users,public.customers to authenticated;
grant select,insert,delete on public.media_assets to authenticated;
grant select on public.admin_activity_logs to authenticated;
revoke insert,delete on public.orders from anon,authenticated;
grant select,update on public.orders to authenticated;
drop policy if exists "Users insert own orders" on public.orders;
drop policy if exists "Staff read orders" on public.orders;
create policy "Staff read orders" on public.orders for select to authenticated using ((select private.has_permission('orders')));
drop policy if exists "Staff update orders" on public.orders;
create policy "Staff update orders" on public.orders for update to authenticated using ((select private.has_permission('orders'))) with check ((select private.has_permission('orders')));
drop policy if exists "Staff read profiles" on public.profiles;
create policy "Staff read profiles" on public.profiles for select to authenticated using ((select private.has_permission('customers')));
create policy "Staff read customers" on public.customers for select to authenticated using ((select private.has_permission('customers')));
create policy "Staff insert customers" on public.customers for insert to authenticated with check ((select private.has_permission('customers')));
create policy "Staff update customers" on public.customers for update to authenticated using ((select private.has_permission('customers'))) with check ((select private.has_permission('customers')));
create policy "Own admin membership or Super Admin" on public.admin_users for select to authenticated using (id = (select auth.uid()) or (select private.has_permission('admins')));
create policy "Super Admin insert admins" on public.admin_users for insert to authenticated with check ((select private.has_permission('admins')));
create policy "Super Admin update admins" on public.admin_users for update to authenticated using ((select private.has_permission('admins'))) with check ((select private.has_permission('admins')));
create policy "Super Admin activity" on public.admin_activity_logs for select to authenticated using ((select private.has_permission('activity')));
create policy "Public collections" on public.collections for select to anon,authenticated using (active and archived_at is null);
create policy "Public packages" on public.packages for select to anon,authenticated using (private.package_is_public(id));
create policy "Public package associations" on public.package_collections for select to anon,authenticated using (exists (
  select 1 from public.collections c where c.id = collection_id and c.active and c.archived_at is null)
  and private.package_is_public(package_id));
create policy "Public package inclusions" on public.package_items for select to anon,authenticated using (private.package_is_public(package_id));
create policy "Public package images" on public.package_images for select to anon,authenticated using (private.package_is_public(package_id));
create policy "Public gallery" on public.gallery_items for select to anon,authenticated using (active and archived_at is null);
create policy "Published reviews" on public.reviews for select to anon,authenticated using (published);
create policy "Active statistics" on public.site_statistics for select to anon,authenticated using (active);
create policy "Public business settings" on public.site_settings for select to anon,authenticated using (key in ('phone','whatsapp','instagram','facebook','tiktok','google_review_url','cms_enabled'));
do $$ declare t text; m text; begin
  foreach t in array array['packages','collections','package_collections','package_items','package_images','gallery_items','reviews','site_statistics','site_settings'] loop
    m := case when t in ('package_collections','package_items','package_images') then 'packages' when t='gallery_items' then 'gallery' when t='site_statistics' then 'content' when t='site_settings' then 'settings' else t end;
    execute format('create policy "Staff read %s" on public.%I for select to authenticated using ((select private.has_permission(%L)))',t,t,m);
    execute format('create policy "Staff insert %s" on public.%I for insert to authenticated with check ((select private.has_permission(%L)))',t,t,m);
    execute format('create policy "Staff update %s" on public.%I for update to authenticated using ((select private.has_permission(%L))) with check ((select private.has_permission(%L)))',t,t,m,m);
    execute format('create policy "Staff delete %s" on public.%I for delete to authenticated using ((select private.has_permission(%L)))',t,t,m);
  end loop;
end $$;
create policy "Staff read media" on public.media_assets for select to authenticated using ((select private.has_permission('media')));
create policy "Staff register media" on public.media_assets for insert to authenticated with check (created_by = (select auth.uid()) and (select private.has_permission('media')));
create policy "Staff delete media" on public.media_assets for delete to authenticated using ((select private.has_permission('media')) and not private.media_in_use(path));

-- Create only this bucket. Existing public legacy video assets remain preserved.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('business-media','business-media',true,8388608,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=8388608,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists "Business media public read" on storage.objects;
create policy "Business media public read" on storage.objects for select to anon,authenticated using (bucket_id = 'business-media');
drop policy if exists "Business media staff insert" on storage.objects;
create policy "Business media staff insert" on storage.objects for insert to authenticated with check (
  bucket_id='business-media' and (select private.has_permission('media'))
  and name ~ '^(packages|collections|gallery|reviews)/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$');
-- Replacement uses a new UUID asset; UPDATE/upsert is intentionally not permitted.
drop policy if exists "Business media staff delete" on storage.objects;
create policy "Business media staff delete" on storage.objects for delete to authenticated using (
  bucket_id='business-media' and (select private.has_permission('media')) and not private.media_in_use(name));

create or replace function public.update_admin_profile(p_display_name text) returns jsonb
language plpgsql security definer set search_path = '' as $$ declare v_row public.admin_users; begin
  if auth.uid() is null or private.current_admin_role() is null then raise exception 'Unauthorized' using errcode='42501'; end if;
  if length(trim(p_display_name)) not between 1 and 160 then raise exception 'Invalid display name' using errcode='22023'; end if;
  update public.admin_users set display_name=trim(p_display_name) where id=auth.uid() and active returning * into v_row;
  return to_jsonb(v_row);
end; $$;
revoke all on function public.update_admin_profile(text) from public,anon;
grant execute on function public.update_admin_profile(text) to authenticated;

create or replace function public.create_customer(p_values jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$ declare v_row public.customers; v_name text; v_phone text; begin
  if not private.has_permission('customers') then raise exception 'Unauthorized' using errcode='42501'; end if;
  v_name := trim(p_values->>'full_name'); v_phone := trim(p_values->>'phone');
  if length(v_name) not between 2 and 160 or v_phone !~ '^\+?[0-9 ()-]{7,25}$' then raise exception 'Invalid customer details' using errcode='22023'; end if;
  insert into public.customers(full_name,phone,normalized_phone,admin_notes)
  values(v_name,v_phone,private.normalize_phone(v_phone),nullif(left(p_values->>'admin_notes',4000),'')) returning * into v_row;
  return to_jsonb(v_row);
end; $$;
revoke all on function public.create_customer(jsonb) from public,anon;
grant execute on function public.create_customer(jsonb) to authenticated;

create or replace function public.manage_admin_user(p_values jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_email text; v_row public.admin_users; begin
  if private.current_admin_role() is distinct from 'super_admin' then raise exception 'Unauthorized' using errcode='42501'; end if;
  v_id := (p_values->>'id')::uuid;
  select email into v_email from auth.users where id=v_id;
  if v_email is null then raise exception 'Use an existing genuine Auth user ID' using errcode='22023'; end if;
  insert into public.admin_users(id,email,display_name,role,active)
  values(v_id,v_email,trim(coalesce(p_values->>'display_name','')),p_values->>'role',coalesce((p_values->>'active')::boolean,true))
  on conflict(id) do update set display_name=excluded.display_name,role=excluded.role,active=excluded.active
  returning * into v_row;
  return to_jsonb(v_row);
end; $$;
revoke all on function public.manage_admin_user(jsonb) from public,anon;
grant execute on function public.manage_admin_user(jsonb) to authenticated;

create or replace function public.customer_order_summary(p_customer_ids uuid[])
returns table(customer_id uuid,total_orders bigint,latest_order timestamptz)
language plpgsql security invoker set search_path = '' as $$ begin
  if not private.has_permission('customers') then raise exception 'Unauthorized' using errcode='42501'; end if;
  if array_length(p_customer_ids,1)>100 then raise exception 'Too many customers requested' using errcode='22023'; end if;
  return query select o.customer_id,count(*),max(o.created_at) from public.orders o
  where o.customer_id=any(p_customer_ids) group by o.customer_id;
end; $$;
revoke all on function public.customer_order_summary(uuid[]) from public,anon;
grant execute on function public.customer_order_summary(uuid[]) to authenticated;

create or replace function public.media_asset_usage(p_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_path text; v_usage jsonb; begin
  if not private.has_permission('media') then raise exception 'Unauthorized' using errcode='42501'; end if;
  select path into v_path from public.media_assets where id=p_id;
  if v_path is null then raise exception 'Media asset not found' using errcode='22023'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('entity_type',x.entity_type,'entity_id',x.entity_id)),'[]'::jsonb) into v_usage from (
    select 'packages' as entity_type,id as entity_id from public.packages where main_image like '%'||v_path or video_url like '%'||v_path
    union all select 'package_images',package_id from public.package_images where image_path like '%'||v_path
    union all select 'collections',id::text from public.collections where cover_image like '%'||v_path
    union all select 'gallery',id::text from public.gallery_items where image_path like '%'||v_path
    union all select 'reviews',id::text from public.reviews where customer_image like '%'||v_path
  ) x;
  return jsonb_build_object('in_use',jsonb_array_length(v_usage)>0,'usage',v_usage);
end; $$;
revoke all on function public.media_asset_usage(uuid) from public,anon;
grant execute on function public.media_asset_usage(uuid) to authenticated;

create or replace function private.valid_content_path(p_path text,p_video boolean default false) returns boolean
language sql immutable set search_path = '' as $$
  select p_path is null or p_path='' or (
    length(p_path)<=2000 and p_path !~ '[[:cntrl:]]' and (
      p_path ~ '^/?assets-[123]/[A-Za-z0-9_./ -]+\.(jpg|jpeg|png|webp|mp4)$'
      or p_path ~ '^https://pzjbfhwzaettkzaxjdte\.supabase\.co/storage/v1/object/public/business-media/(packages|collections|gallery|reviews)/[0-9a-f-]+\.(jpg|jpeg|png|webp)$'
    ) and (p_video or p_path !~ '\.mp4$') and p_path !~ '(^|/)\.\.(/|$)'
  );
$$;
revoke all on function private.valid_content_path(text,boolean) from public;

create or replace function public.save_package(p_values jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_id text; v_collection uuid; v_item jsonb; v_row public.packages; begin
  if not private.has_permission('packages') then raise exception 'Unauthorized' using errcode='42501'; end if;
  if jsonb_typeof(p_values) is distinct from 'object' or octet_length(p_values::text)>100000 then raise exception 'Invalid package data' using errcode='22023'; end if;
  v_id := trim(p_values->>'id');
  if length(v_id) not between 1 and 80 then raise exception 'Invalid package ID' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtext('surprisewala-package-'||v_id));
  if jsonb_typeof(p_values->'collection_ids') is distinct from 'array' or jsonb_array_length(p_values->'collection_ids') not between 1 and 30
    or jsonb_typeof(p_values->'items') is distinct from 'array' or jsonb_array_length(p_values->'items')>50
    or jsonb_typeof(p_values->'images') is distinct from 'array' or jsonb_array_length(p_values->'images')>30 then
    raise exception 'Choose collections and valid inclusion/image lists' using errcode='22023';
  end if;
  for v_collection in select value::uuid from jsonb_array_elements_text(p_values->'collection_ids') loop
    if not exists(select 1 from public.collections where id=v_collection and archived_at is null) then raise exception 'A selected collection is unavailable' using errcode='22023'; end if;
  end loop;
  if not private.valid_content_path(p_values->>'main_image') or not private.valid_content_path(p_values->>'video_url',true) then raise exception 'Invalid media path' using errcode='22023'; end if;
  insert into public.packages(id,slug,name,badge,description,price,price_note,main_image,video_url,video_orientation,order_mode,active,featured,display_order,archived_at)
  values(v_id,p_values->>'slug',trim(p_values->>'name'),coalesce(p_values->>'badge',''),coalesce(p_values->>'description',''),nullif(p_values->>'price','')::numeric,
    coalesce(p_values->>'price_note',''),nullif(p_values->>'main_image',''),nullif(p_values->>'video_url',''),coalesce(p_values->>'video_orientation','portrait'),
    coalesce(p_values->>'order_mode','cart'),coalesce((p_values->>'active')::boolean,true),coalesce((p_values->>'featured')::boolean,false),coalesce((p_values->>'display_order')::integer,0),nullif(p_values->>'archived_at','')::timestamptz)
  on conflict(id) do update set slug=excluded.slug,name=excluded.name,badge=excluded.badge,description=excluded.description,price=excluded.price,price_note=excluded.price_note,
    main_image=excluded.main_image,video_url=excluded.video_url,video_orientation=excluded.video_orientation,order_mode=excluded.order_mode,
    active=excluded.active,featured=excluded.featured,display_order=excluded.display_order,archived_at=excluded.archived_at returning * into v_row;
  delete from public.package_collections where package_id=v_id;
  insert into public.package_collections(package_id,collection_id) select v_id,value::uuid from jsonb_array_elements_text(p_values->'collection_ids') on conflict do nothing;
  delete from public.package_items where package_id=v_id;
  for v_item in select value from jsonb_array_elements(p_values->'items') loop
    insert into public.package_items(package_id,label,display_order) values(v_id,trim(v_item->>'label'),coalesce((v_item->>'display_order')::integer,0));
  end loop;
  delete from public.package_images where package_id=v_id;
  for v_item in select value from jsonb_array_elements(p_values->'images') loop
    if not private.valid_content_path(v_item->>'image_path') or coalesce(v_item->>'image_path','')='' then raise exception 'Invalid package image' using errcode='22023'; end if;
    insert into public.package_images(package_id,image_path,alt_text,display_order) values(v_id,v_item->>'image_path',coalesce(v_item->>'alt_text',''),coalesce((v_item->>'display_order')::integer,0));
  end loop;
  return to_jsonb(v_row);
end; $$;
revoke all on function public.save_package(jsonb) from public,anon;
grant execute on function public.save_package(jsonb) to authenticated;

create or replace function public.duplicate_package(p_id text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_original public.packages; v_id text; v_row public.packages; begin
  if not private.has_permission('packages') then raise exception 'Unauthorized' using errcode='42501'; end if;
  select * into v_original from public.packages where id=p_id;
  if v_original.id is null then raise exception 'Package not found' using errcode='22023'; end if;
  v_id := gen_random_uuid()::text;
  insert into public.packages(id,slug,name,badge,description,price,price_note,main_image,video_url,video_orientation,order_mode,active,featured,display_order)
  values(v_id,left(v_original.slug,100)||'-copy-'||left(v_id,8),left(v_original.name,190)||' (copy)',v_original.badge,v_original.description,v_original.price,
    v_original.price_note,v_original.main_image,v_original.video_url,v_original.video_orientation,v_original.order_mode,false,false,v_original.display_order+1) returning * into v_row;
  insert into public.package_collections select v_id,collection_id from public.package_collections where package_id=p_id;
  insert into public.package_items(package_id,label,display_order) select v_id,label,display_order from public.package_items where package_id=p_id;
  insert into public.package_images(package_id,image_path,alt_text,display_order) select v_id,image_path,alt_text,display_order from public.package_images where package_id=p_id;
  return to_jsonb(v_row);
end; $$;
revoke all on function public.duplicate_package(text) from public,anon;
grant execute on function public.duplicate_package(text) to authenticated;

create or replace function public.submit_booking(p_payload jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_key uuid; v_owner uuid := auth.uid(); v_existing public.orders; v_order public.orders;
  v_customer uuid; v_field text; v_value text; v_date date; v_time time; v_items jsonb; v_item jsonb;
  v_snapshot jsonb := '[]'::jsonb; v_pack public.packages; v_qty integer; v_total numeric(12,2):=0;
  v_custom boolean:=false; v_first_id text; v_first_name text; v_weight text; v_topper text; v_customization jsonb;
begin
  if jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>65536 then raise exception 'Invalid booking details' using errcode='22023'; end if;
  if p_payload->>'submission_key' is null then raise exception 'A booking submission key is required' using errcode='22023'; end if;
  v_key := (p_payload->>'submission_key')::uuid;
  perform pg_advisory_xact_lock(hashtext('surprisewala-booking-'||v_key::text));
  select * into v_existing from public.orders where submission_key=v_key;
  if v_existing.id is not null then
    if v_existing.user_id is distinct from v_owner then raise exception 'This booking submission belongs to another session' using errcode='42501'; end if;
    return jsonb_build_object('id',v_existing.id,'order_reference',v_existing.order_reference,'subtotal',v_existing.subtotal,'total',v_existing.total,'customizable',v_existing.order_type='custom_package');
  end if;
  foreach v_field in array array['customer_name','customer_phone','surprise_date','surprise_location','surprise_time','surprise_type','recipient_name','recipient_relationship'] loop
    v_value := trim(coalesce(p_payload->>v_field,''));
    if v_value='' or length(v_value)>240 then raise exception 'Complete all required booking details' using errcode='22023'; end if;
  end loop;
  if length(trim(p_payload->>'customer_name'))<2 or length(trim(p_payload->>'recipient_name'))<2 or length(trim(p_payload->>'surprise_location'))<2
    or length(coalesce(p_payload->>'special_notes',''))>2000 then raise exception 'Invalid booking details' using errcode='22023'; end if;
  if p_payload->>'customer_phone' !~ '^\+?[0-9 ()-]{7,25}$' or (coalesce(p_payload->>'recipient_phone','')<>'' and p_payload->>'recipient_phone' !~ '^\+?[0-9 ()-]{7,25}$') then raise exception 'Enter valid phone numbers' using errcode='22023'; end if;
  if coalesce(p_payload->>'customer_email','')<>'' and (length(p_payload->>'customer_email')>240 or p_payload->>'customer_email' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') then raise exception 'Invalid email address' using errcode='22023'; end if;
  if p_payload->>'surprise_date' !~ '^\d{4}-\d{2}-\d{2}$' or p_payload->>'surprise_time' !~ '^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$' then raise exception 'Invalid surprise date or time' using errcode='22023'; end if;
  v_date := (p_payload->>'surprise_date')::date; v_time := (p_payload->>'surprise_time')::time;
  if v_date<(now() at time zone 'Asia/Colombo')::date then raise exception 'Surprise date cannot be in the past' using errcode='22023'; end if;
  if p_payload->>'surprise_type' not in ('Birthday','Anniversary','Proposal','Romantic Surprise','Graduation','Welcome Surprise','Baby Shower','Other')
    or p_payload->>'recipient_relationship' not in ('Husband','Wife','Boyfriend','Girlfriend','Fiancé','Fiancée','Friend','Best Friend','Mother','Father','Brother','Sister','Family Member','Colleague','Other') then raise exception 'Choose valid booking options' using errcode='22023'; end if;
  if (p_payload->>'surprise_type'='Other' and length(trim(coalesce(p_payload->>'custom_surprise_type','')))=0)
    or (p_payload->>'recipient_relationship'='Other' and length(trim(coalesce(p_payload->>'custom_relationship','')))=0)
    or length(coalesce(p_payload->>'custom_surprise_type',''))>160 or length(coalesce(p_payload->>'custom_relationship',''))>160 then raise exception 'Specify valid custom booking options' using errcode='22023'; end if;
  v_items := coalesce(p_payload->'items',jsonb_build_array(jsonb_build_object('id',p_payload->>'package_id','quantity',1)));
  if jsonb_typeof(v_items) is distinct from 'array' or jsonb_array_length(v_items) not between 1 and 30 then raise exception 'Choose at least one package' using errcode='22023'; end if;
  for v_item in select value from jsonb_array_elements(v_items) loop
    if jsonb_typeof(v_item) is distinct from 'object' or coalesce(v_item->>'quantity','1') !~ '^[0-9]{1,2}$' then raise exception 'Invalid package quantity' using errcode='22023'; end if;
    v_qty := coalesce((v_item->>'quantity')::integer,1);
    if v_qty not between 1 and 20 then raise exception 'Package quantity must be between 1 and 20' using errcode='22023'; end if;
    select * into v_pack from public.packages where id=v_item->>'id' and private.package_is_public(id) for share;
    if v_pack.id is null then raise exception 'A selected package is unavailable' using errcode='22023'; end if;
    v_customization := '{}'::jsonb;
    if v_pack.order_mode='cake' then
      v_weight := coalesce(v_item->'customization'->>'weight',v_item->>'weight','');
      v_topper := coalesce(v_item->'customization'->>'topper',v_item->>'topper','');
      if v_weight not in ('500g','1kg') or v_topper not in ('','Happy Birthday','Happy Anniversary')
        or length(coalesce(v_item->'customization'->>'message',v_item->>'wording',''))>240 then raise exception 'Choose valid cake options' using errcode='22023'; end if;
      v_customization := jsonb_build_object('weight',v_weight,'topper',v_topper,'message',coalesce(v_item->'customization'->>'message',v_item->>'wording',''));
    end if;
    if v_pack.order_mode in ('enquiry','cake') then v_custom:=true;
    else v_total:=v_total+v_pack.price*v_qty; end if;
    if v_first_id is null then v_first_id:=v_pack.id; v_first_name:=v_pack.name; end if;
    v_snapshot:=v_snapshot||jsonb_build_array(jsonb_build_object('id',v_pack.id,'name',v_pack.name,'quantity',v_qty,'price',v_pack.price,'order_mode',v_pack.order_mode,'customization',v_customization));
  end loop;
  -- Mixed/custom quotes preserve each known line price; the total remains unconfirmed.
  if v_custom then v_total:=0; end if;
  if v_owner is null then
    insert into public.customers(full_name,phone,normalized_phone)
    values(trim(p_payload->>'customer_name'),trim(p_payload->>'customer_phone'),private.normalize_phone(p_payload->>'customer_phone')) returning id into v_customer;
  else
    insert into public.customers(user_id,full_name,phone,normalized_phone)
    values(v_owner,trim(p_payload->>'customer_name'),trim(p_payload->>'customer_phone'),private.normalize_phone(p_payload->>'customer_phone'))
    on conflict(user_id) do update set full_name=excluded.full_name,phone=excluded.phone,normalized_phone=excluded.normalized_phone returning id into v_customer;
  end if;
  insert into public.orders(user_id,customer_id,submission_key,order_reference,order_type,items,total_amount,status,order_status,
    customer_notes,customer_name,customer_phone,customer_email,surprise_date,surprise_location,surprise_time,surprise_type,
    custom_surprise_type,recipient_name,recipient_phone,recipient_relationship,custom_relationship,special_notes,
    package_id,package_name,currency,subtotal,fees,total,payment_method,payment_status)
  values(v_owner,v_customer,v_key,'SW-'||to_char(now() at time zone 'Asia/Colombo','YYYY')||'-'||lpad(nextval('private.order_reference_seq')::text,6,'0'),
    case when v_custom then 'custom_package' else 'package' end,v_snapshot,v_total,'new','new',nullif(p_payload->>'special_notes',''),
    trim(p_payload->>'customer_name'),trim(p_payload->>'customer_phone'),nullif(trim(p_payload->>'customer_email'),''),v_date,trim(p_payload->>'surprise_location'),v_time,
    p_payload->>'surprise_type',nullif(trim(p_payload->>'custom_surprise_type'),''),trim(p_payload->>'recipient_name'),nullif(trim(p_payload->>'recipient_phone'),''),
    p_payload->>'recipient_relationship',nullif(trim(p_payload->>'custom_relationship'),''),nullif(p_payload->>'special_notes',''),v_first_id,v_first_name,'LKR',v_total,0,v_total,null,'pending')
  returning * into v_order;
  return jsonb_build_object('id',v_order.id,'order_reference',v_order.order_reference,'subtotal',v_order.subtotal,'total',v_order.total,'customizable',v_custom);
end; $$;
revoke all on function public.submit_booking(jsonb) from public;
grant execute on function public.submit_booking(jsonb) to anon,authenticated;

commit;
