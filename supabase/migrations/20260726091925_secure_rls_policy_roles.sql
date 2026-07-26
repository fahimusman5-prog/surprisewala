-- Ownership policies are for signed-in customers only.  The original
-- migration relied on revoked anonymous privileges; scoping policies removes
-- anonymous eligibility as a second layer of defence.
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users read own addresses" on public.addresses;
create policy "Users read own addresses" on public.addresses
  for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "Users insert own addresses" on public.addresses;
create policy "Users insert own addresses" on public.addresses
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "Users update own addresses" on public.addresses;
create policy "Users update own addresses" on public.addresses
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "Users delete own addresses" on public.addresses;
create policy "Users delete own addresses" on public.addresses
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders" on public.orders
  for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "Users insert own orders" on public.orders;
create policy "Users insert own orders" on public.orders
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'pending'
  );
