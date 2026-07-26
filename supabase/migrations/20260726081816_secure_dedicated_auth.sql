-- Apply after 20260621000000_membership.sql in the new dedicated project.
-- Roles are assigned only by a privileged database operator (for example, the
-- Supabase dashboard) and are never accepted from customer registration.

alter table public.profiles
  add column if not exists role text not null default 'customer',
  add column if not exists updated_at timestamptz not null default now();

alter table public.profiles
  drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('customer', 'admin'));

create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon, authenticated;

-- Profiles are created by the auth trigger. Customers can only update their
-- own approved fields; the trigger below rejects email and role changes.
drop policy if exists "Users insert own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update approved profile fields" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create or replace function public.protect_profile_authorization()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null and (
    new.role is distinct from old.role or new.email is distinct from old.email
  ) then
    raise exception 'Customers cannot change account role or email';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.protect_profile_authorization() from public, anon, authenticated;
drop trigger if exists protect_profile_authorization on public.profiles;
create trigger protect_profile_authorization
  before update on public.profiles
  for each row execute procedure public.protect_profile_authorization();

-- These triggers invoke their functions internally. They must not be exposed
-- as RPC endpoints to anonymous or authenticated clients.
revoke all on function public.keep_single_default_address() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

-- Replace the original trigger so every sign-up gets the secure default role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 160),
    new.email,
    left(coalesce(new.raw_user_meta_data ->> 'phone', ''), 40),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
