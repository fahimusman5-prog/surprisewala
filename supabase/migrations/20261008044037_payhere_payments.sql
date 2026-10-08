-- PayHere schema preparation; target pzjbfhwzaettkzaxjdte ONLY.
-- Requires the three earlier migrations. Review the live schema before applying.
begin;
grant usage on schema private to service_role;
grant select,update on public.orders to service_role;
grant select on public.site_settings to service_role;
create table public.payhere_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  provider text not null default 'payhere' check(provider='payhere'),
  mode text not null check(mode in ('sandbox','live')),
  status text not null default 'unpaid' check(status in ('unpaid','pending','paid','failed','cancelled','refunded','chargeback')),
  amount numeric(12,2) not null check(amount>0), currency text not null check(currency='LKR'),
  payment_id text unique, method text, paid_at timestamptz, verified_at timestamptz,
  policy_version text not null, consent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index payhere_order_idx on public.payhere_payments(order_id,created_at desc);
create unique index payhere_one_open_idx on public.payhere_payments(order_id) where status in ('unpaid','pending');
create table public.payhere_events (
  signature text primary key check(length(signature)=32),
  attempt_id uuid not null references public.payhere_payments(id),
  payment_id text not null, status text not null, received_at timestamptz not null default now()
);
alter table public.payhere_payments enable row level security;
alter table public.payhere_events enable row level security;
revoke all on public.payhere_payments,public.payhere_events from public,anon,authenticated;
grant all on public.payhere_payments,public.payhere_events to service_role;
grant select on public.payhere_payments to authenticated;
create policy "Staff read payment metadata" on public.payhere_payments for select to authenticated
using ((select private.has_permission('orders')));
-- Server-only invoker functions. No public ability to manufacture a verified state.
create function public.begin_payhere_payment(p_order uuid,p_user uuid,p_amount numeric,p_mode text,p_policy_version text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare o public.orders; a public.payhere_payments; calculated numeric;
begin
  select * into o from public.orders where id=p_order and user_id=p_user for update;
  if not exists(select 1 from public.site_settings where key='cms_enabled' and value='true') then raise exception 'Managed catalog must be verified before payment'; end if;
  if o.id is null or o.order_type<>'package' or o.currency<>'LKR' or o.total<=0
    or o.payment_status in ('paid','partially_paid','deposit_paid','refunded','chargeback')
    or coalesce(o.order_status,o.status) not in ('confirmed','preparing','scheduled') then raise exception 'Order not payable'; end if;
  if jsonb_array_length(o.items)=0 or exists(select 1 from jsonb_array_elements(o.items) i where i->>'order_mode' is distinct from 'cart' or (i->>'quantity')::numeric not between 1 and 20 or (i->>'price')::numeric <= 0) then raise exception 'Quote required'; end if;
  select sum((i->>'price')::numeric*(i->>'quantity')::integer) into calculated from jsonb_array_elements(o.items) i;
  if calculated is distinct from o.subtotal or calculated+o.fees is distinct from o.total or o.total is distinct from o.total_amount or o.total is distinct from p_amount then raise exception 'Invalid amount'; end if;
  select * into a from public.payhere_payments where order_id=p_order and status in ('unpaid','pending') for update;
  if a.id is not null then
    if a.mode<>p_mode or a.amount<>p_amount then raise exception 'Payment configuration changed; reconcile first'; end if;
    if a.status='pending' then raise exception 'Payment awaiting confirmation'; end if;
    return to_jsonb(a);
  end if;
  if exists(select 1 from public.payhere_payments where order_id=p_order and status in ('paid','chargeback','refunded')) then raise exception 'Order already settled'; end if;
  insert into public.payhere_payments(order_id,mode,status,amount,currency,policy_version) values(p_order,p_mode,'pending',p_amount,'LKR',p_policy_version) returning * into a;
  return to_jsonb(a);
end; $$;
create function public.apply_payhere_notification(p_attempt uuid,p_payment_id text,p_amount numeric,p_currency text,p_status text,p_method text,p_signature text,p_mode text)
returns text language plpgsql security invoker set search_path='' as $$
declare a public.payhere_payments; o public.orders;
begin
  -- Consistent lock order with initiation prevents callback/checkout deadlocks.
  select * into a from public.payhere_payments where id=p_attempt;
  if a.id is null then raise exception 'Unknown attempt'; end if;
  select * into o from public.orders where id=a.order_id for update;
  select * into a from public.payhere_payments where id=p_attempt for update;
  if a.amount<>p_amount or o.total<>p_amount or o.total_amount<>p_amount or a.currency<>p_currency or o.currency<>p_currency or a.mode<>p_mode
    or p_status not in ('paid','pending','cancelled','failed','chargeback') then raise exception 'Notification mismatch'; end if;
  if a.payment_id is not null and a.payment_id<>p_payment_id then raise exception 'Payment identifier mismatch'; end if;
  if exists(select 1 from public.payhere_events where signature=p_signature) then return 'duplicate'; end if;
  insert into public.payhere_events(signature,attempt_id,payment_id,status) values(p_signature,p_attempt,p_payment_id,p_status);
  -- Late/reordered negative callbacks cannot overwrite a settled payment.
  if a.status in ('refunded','chargeback') or (a.status='paid' and p_status<>'chargeback')
    or (a.status in ('failed','cancelled') and p_status in ('pending','failed','cancelled')) then return 'ignored'; end if;
  if p_status='paid' and exists(select 1 from public.payhere_payments where order_id=a.order_id and id<>a.id and status='paid') then raise exception 'Duplicate settlement needs reconciliation'; end if;
  update public.payhere_payments set status=p_status,payment_id=p_payment_id,method=nullif(p_method,''),verified_at=now(),paid_at=case when p_status='paid' then coalesce(paid_at,now()) else paid_at end where id=p_attempt;
  -- Preserve independent fulfilment state and all booking snapshots.
  if o.payment_status not in ('paid','refunded','chargeback') or p_status='chargeback' then
    update public.orders set payment_status=p_status where id=a.order_id;
  end if;
  return 'applied';
end; $$;
revoke all on function public.begin_payhere_payment(uuid,uuid,numeric,text,text) from public,anon,authenticated;
revoke all on function public.apply_payhere_notification(uuid,text,numeric,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.begin_payhere_payment(uuid,uuid,numeric,text,text) to service_role;
grant execute on function public.apply_payhere_notification(uuid,text,numeric,text,text,text,text,text) to service_role;
-- Preserve the existing immutability and status synchronisation trigger, add provider states.
create or replace function private.protect_order_history() returns trigger
language plpgsql set search_path='' as $$
begin
  if (to_jsonb(new)-array['status','order_status','payment_status','admin_notes','updated_at']) is distinct from
    (to_jsonb(old)-array['status','order_status','payment_status','admin_notes','updated_at']) then
    raise exception 'Historical booking details and prices are immutable' using errcode='23514'; end if;
  if new.order_status is distinct from old.order_status then new.status:=new.order_status;
  elsif new.status is distinct from old.status then new.order_status:=new.status; end if;
  if coalesce(new.order_status,new.status) not in ('pending','new','contacted','confirmed','preparing','scheduled','completed','cancelled') then raise exception 'Invalid order status' using errcode='23514'; end if;
  if new.payment_status not in ('pending','unpaid','partially_paid','paid','refunded','cancelled','failed','chargeback') then raise exception 'Invalid payment status' using errcode='23514'; end if;
  -- Admins can manage offline records as before, but provider records come from verification.
  if new.payment_status is distinct from old.payment_status and current_user<>'service_role'
    and private.has_payhere_payment(old.id) then
    raise exception 'Provider payment state must be verified server-side' using errcode='42501'; end if;
  return new;
end; $$;
-- Trigger requires only an existence check for staff; expose no transaction records.
create function private.has_payhere_payment(p_order uuid) returns boolean
language sql security definer stable set search_path='' as $$
  select exists(select 1 from public.payhere_payments p join public.orders o on o.id=p.order_id where p.order_id=p_order and (o.user_id=auth.uid() or private.has_permission('orders')))
$$;
revoke all on function private.has_payhere_payment(uuid) from public;
grant execute on function private.has_payhere_payment(uuid) to authenticated,service_role;
-- Only existence is exposed to the order owner or authorised staff.
commit;
