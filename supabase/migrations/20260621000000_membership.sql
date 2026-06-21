create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  phone text not null,
  address_line text not null,
  city text not null,
  country text not null default 'Sri Lanka',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_type text not null default 'whatsapp_checkout',
  items jsonb not null default '[]'::jsonb,
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  status text not null default 'pending',
  customer_notes text,
  created_at timestamptz not null default now()
);

create index if not exists addresses_user_id_idx on public.addresses(user_id);
create index if not exists orders_user_id_created_at_idx on public.orders(user_id, created_at desc);
create unique index if not exists one_default_address_per_user on public.addresses(user_id) where is_default;

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select using ((select auth.uid()) = id);
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles for insert with check ((select auth.uid()) = id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Users read own addresses" on public.addresses;
create policy "Users read own addresses" on public.addresses for select using ((select auth.uid()) = user_id);
drop policy if exists "Users insert own addresses" on public.addresses;
create policy "Users insert own addresses" on public.addresses for insert with check ((select auth.uid()) = user_id);
drop policy if exists "Users update own addresses" on public.addresses;
create policy "Users update own addresses" on public.addresses for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users delete own addresses" on public.addresses;
create policy "Users delete own addresses" on public.addresses for delete using ((select auth.uid()) = user_id);

drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders" on public.orders for select using ((select auth.uid()) = user_id);
drop policy if exists "Users insert own orders" on public.orders;
create policy "Users insert own orders" on public.orders for insert with check ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email, new.raw_user_meta_data ->> 'phone')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.keep_single_default_address()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.is_default then
    update public.addresses set is_default = false where user_id = new.user_id and id <> new.id and is_default;
  end if;
  return new;
end;
$$;

drop trigger if exists before_default_address_write on public.addresses;
create trigger before_default_address_write before insert or update of is_default on public.addresses
for each row execute procedure public.keep_single_default_address();
