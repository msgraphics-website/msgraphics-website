-- =====================================================================
-- M.S. Graphics Studio: orders, staff and order tracking
-- Run this once in Supabase → SQL Editor → New query → Run.
-- It is safe to run again: it only creates what is missing and replaces functions.
-- =====================================================================

-- ---------- Staff profiles (one row per login) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  staff_id text unique not null,               -- what they type to log in, e.g. "ravi"
  full_name text not null default '',
  role text not null default 'staff' check (role in ('admin', 'staff')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null default '',  -- filled in automatically, e.g. MS2610-4821
  client_name text not null,
  client_phone text not null,
  client_company text not null default '',
  client_email text not null default '',
  service text not null default '',
  description text not null default '',
  quantity text not null default '',
  amount numeric(12, 2),
  due_date date,
  status text not null default 'received'
    check (status in ('received', 'design', 'approval', 'production', 'fabrication', 'qc', 'dispatched', 'completed', 'hold', 'cancelled')),
  internal_notes text not null default '',
  created_by uuid references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- ---------- Order history (every status change) ----------
create table if not exists public.order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null
    check (status in ('received', 'design', 'approval', 'production', 'fabrication', 'qc', 'dispatched', 'completed', 'hold', 'cancelled')),
  note text not null default '',
  show_to_client boolean not null default true,
  created_by uuid references auth.users (id) default auth.uid(),
  created_by_name text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_idx on public.order_events (order_id, created_at);

-- ---------- Helper checks used by the security rules ----------
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and active);
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and active and role = 'admin');
$$;

-- ---------- Order code: MS + year + month + "-" + 4 random digits ----------
create or replace function public.orders_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  candidate text;
begin
  if new.order_code is null or new.order_code = '' then
    loop
      candidate := 'MS' || to_char(now() at time zone 'Asia/Kolkata', 'YYMM') || '-' || lpad((floor(random() * 10000))::int::text, 4, '0');
      exit when not exists (select 1 from public.orders where order_code = candidate);
    end loop;
    new.order_code := candidate;
  end if;
  new.order_code := upper(new.order_code);
  new.status := 'received';
  return new;
end $$;

drop trigger if exists orders_before_insert on public.orders;
create trigger orders_before_insert before insert on public.orders
  for each row execute function public.orders_before_insert();

-- First history entry for every new order
create or replace function public.orders_after_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.order_events (order_id, status, note, show_to_client, created_by, created_by_name)
  values (new.id, 'received', '', true, new.created_by,
          coalesce((select full_name from public.profiles where id = new.created_by), ''));
  return new;
end $$;

drop trigger if exists orders_after_insert on public.orders;
create trigger orders_after_insert after insert on public.orders
  for each row execute function public.orders_after_insert();

-- Status changes happen by adding a history entry; this keeps the order in step.
create or replace function public.order_events_after_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.orders set status = new.status where id = new.order_id;
  return new;
end $$;

drop trigger if exists order_events_after_insert on public.order_events;
create trigger order_events_after_insert after insert on public.order_events
  for each row execute function public.order_events_after_insert();

-- Fill in who wrote the history entry
create or replace function public.order_events_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.created_by_name = '' then
    new.created_by_name := coalesce((select full_name from public.profiles where id = coalesce(new.created_by, auth.uid())), '');
  end if;
  return new;
end $$;

drop trigger if exists order_events_before_insert on public.order_events;
create trigger order_events_before_insert before insert on public.order_events
  for each row execute function public.order_events_before_insert();

-- Status can only be changed through the history (so nothing is lost), and the code never changes.
create or replace function public.orders_before_update() returns trigger
language plpgsql set search_path = public as $$
begin
  new.order_code := old.order_code;
  new.created_by := old.created_by;
  new.created_at := old.created_at;
  -- A direct edit can't change the status; only a new history entry can (that update runs one trigger level deeper).
  if pg_trigger_depth() <= 1 then
    new.status := old.status;
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists orders_before_update on public.orders;
create trigger orders_before_update before update on public.orders
  for each row execute function public.orders_before_update();

-- ---------- Security rules (Row Level Security) ----------
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_events enable row level security;

drop policy if exists "staff read profiles" on public.profiles;
create policy "staff read profiles" on public.profiles for select to authenticated using (public.is_staff() or id = auth.uid());
drop policy if exists "admin update profiles" on public.profiles;
create policy "admin update profiles" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "staff read orders" on public.orders;
create policy "staff read orders" on public.orders for select to authenticated using (public.is_staff());
drop policy if exists "staff add orders" on public.orders;
create policy "staff add orders" on public.orders for insert to authenticated with check (public.is_staff());
drop policy if exists "staff edit orders" on public.orders;
create policy "staff edit orders" on public.orders for update to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "admin delete orders" on public.orders;
create policy "admin delete orders" on public.orders for delete to authenticated using (public.is_admin());

drop policy if exists "staff read events" on public.order_events;
create policy "staff read events" on public.order_events for select to authenticated using (public.is_staff());
drop policy if exists "staff add events" on public.order_events;
create policy "staff add events" on public.order_events for insert to authenticated with check (public.is_staff());

-- Visitors (not logged in) get no direct access to any table.
revoke all on public.profiles, public.orders, public.order_events from anon;

-- ---------- Public tracking: order code + last 4 digits of the phone ----------
create or replace function public.track_order(p_code text, p_phone_last4 text) returns json
language plpgsql stable security definer set search_path = public as $$
declare
  o public.orders;
begin
  select * into o from public.orders
   where order_code = upper(trim(p_code))
     and right(regexp_replace(client_phone, '\D', '', 'g'), 4) = regexp_replace(coalesce(p_phone_last4, ''), '\D', '', 'g')
     and length(regexp_replace(coalesce(p_phone_last4, ''), '\D', '', 'g')) = 4;
  if not found then
    return null;
  end if;
  return json_build_object(
    'order_code', o.order_code,
    'client_name', split_part(o.client_name, ' ', 1),
    'service', o.service,
    'description', o.description,
    'quantity', o.quantity,
    'status', o.status,
    'due_date', o.due_date,
    'created_at', o.created_at,
    'updated_at', o.updated_at,
    'events', coalesce((
      select json_agg(json_build_object('status', e.status, 'note', e.note, 'at', e.created_at) order by e.created_at)
        from public.order_events e where e.order_id = o.id and e.show_to_client
    ), '[]'::json)
  );
end $$;

revoke all on function public.track_order(text, text) from public;
grant execute on function public.track_order(text, text) to anon, authenticated;
