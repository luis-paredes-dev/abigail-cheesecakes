-- =============================================================
-- Security: RLS, grants, admin check, and order placement RPC.
-- RLS is the security boundary (Blueprint principle 3).
-- =============================================================

-- ---------- Admin check ----------
-- Admins have app_metadata.role = 'admin'. app_metadata can only be
-- set server-side (service role), so users cannot grant it to themselves.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- ---------- Enable RLS on every table ----------
alter table public.products       enable row level security;
alter table public.product_sizes  enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.customers      enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;

-- ---------- Table grants (RLS then filters rows) ----------
-- New tables are not auto-exposed, so access is granted explicitly.
grant select on public.products, public.product_sizes, public.delivery_zones
  to anon, authenticated;

grant insert, update, delete on public.products, public.product_sizes, public.delivery_zones
  to authenticated;

grant select, insert, update, delete on public.customers, public.orders, public.order_items
  to authenticated;

-- ---------- Catalogue: public reads active rows, admins read/write all ----------
create policy "Public can read active products"
  on public.products for select
  to anon, authenticated
  using (is_active or (select public.is_admin()));

create policy "Admins can insert products"
  on public.products for insert to authenticated
  with check ((select public.is_admin()));
create policy "Admins can update products"
  on public.products for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete products"
  on public.products for delete to authenticated
  using ((select public.is_admin()));

create policy "Public can read active sizes of active products"
  on public.product_sizes for select
  to anon, authenticated
  using (
    (is_active and exists (
      select 1 from public.products p
      where p.id = product_sizes.product_id and p.is_active
    ))
    or (select public.is_admin())
  );

create policy "Admins can insert product sizes"
  on public.product_sizes for insert to authenticated
  with check ((select public.is_admin()));
create policy "Admins can update product sizes"
  on public.product_sizes for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete product sizes"
  on public.product_sizes for delete to authenticated
  using ((select public.is_admin()));

create policy "Public can read active delivery zones"
  on public.delivery_zones for select
  to anon, authenticated
  using (is_active or (select public.is_admin()));

create policy "Admins can insert delivery zones"
  on public.delivery_zones for insert to authenticated
  with check ((select public.is_admin()));
create policy "Admins can update delivery zones"
  on public.delivery_zones for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete delivery zones"
  on public.delivery_zones for delete to authenticated
  using ((select public.is_admin()));

-- ---------- Customers, orders, items: admins only ----------
create policy "Admins manage customers"
  on public.customers for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admins manage orders"
  on public.orders for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admins manage order items"
  on public.order_items for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------- Order placement (the only way visitors write data) ----------
-- Runs with elevated rights (security definer) but validates everything
-- and computes prices from the database, never from the client.
create or replace function public.place_order(
  p_full_name         text,
  p_phone             text,
  p_email             text,
  p_fulfilment_method public.fulfilment_method,
  p_delivery_zone_id  uuid,
  p_delivery_address  text,
  p_notes             text,
  p_items             jsonb
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item_count  integer;
  v_matched     integer;
  v_valid_qty   boolean;
  v_subtotal    integer;
  v_fee         integer := 0;
  v_customer_id uuid;
  v_order_id    uuid;
  v_reference   text;
begin
  -- Items must be a non-empty array of a sensible size.
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Items must be an array';
  end if;
  v_item_count := jsonb_array_length(p_items);
  if v_item_count = 0 or v_item_count > 50 then
    raise exception 'Order must contain between 1 and 50 items';
  end if;

  -- Every item must point at an active size of an active product,
  -- with a quantity between 1 and 20. Prices come from the database.
  with requested as (
    select (e ->> 'product_size_id')::uuid as size_id,
           (e ->> 'quantity')::integer     as quantity
    from jsonb_array_elements(p_items) as e
  )
  select count(ps.id),
         coalesce(bool_and(r.quantity between 1 and 20), false),
         coalesce(sum(ps.price_pence * r.quantity), 0)
    into v_matched, v_valid_qty, v_subtotal
  from requested r
  join public.product_sizes ps on ps.id = r.size_id and ps.is_active
  join public.products p       on p.id = ps.product_id and p.is_active;

  if v_matched <> v_item_count then
    raise exception 'One or more items are unavailable';
  end if;
  if not v_valid_qty then
    raise exception 'Quantities must be between 1 and 20';
  end if;

  -- Delivery needs an active zone; its fee comes from the database.
  if p_fulfilment_method = 'delivery' then
    select dz.fee_pence into v_fee
    from public.delivery_zones dz
    where dz.id = p_delivery_zone_id and dz.is_active;
    if not found then
      raise exception 'Invalid delivery zone';
    end if;
  end if;

  insert into public.customers (full_name, phone, email)
  values (p_full_name, p_phone, nullif(trim(p_email), ''))
  returning id into v_customer_id;

  insert into public.orders (
    customer_id, fulfilment_method, delivery_zone_id, delivery_address, notes,
    subtotal_pence, delivery_fee_pence, discount_pence, total_pence
  )
  values (
    v_customer_id,
    p_fulfilment_method,
    case when p_fulfilment_method = 'delivery' then p_delivery_zone_id end,
    case when p_fulfilment_method = 'delivery' then p_delivery_address end,
    nullif(trim(p_notes), ''),
    v_subtotal, v_fee, 0, v_subtotal + v_fee
  )
  returning id, reference into v_order_id, v_reference;

  insert into public.order_items (
    order_id, product_size_id, product_name, size_label, unit_price_pence, quantity
  )
  select v_order_id, ps.id, p.name, ps.label, ps.price_pence, r.quantity
  from (
    select (e ->> 'product_size_id')::uuid as size_id,
           (e ->> 'quantity')::integer     as quantity
    from jsonb_array_elements(p_items) as e
  ) r
  join public.product_sizes ps on ps.id = r.size_id
  join public.products p       on p.id = ps.product_id;

  return v_reference;
end;
$$;

-- Only the RPC is callable by visitors; functions are not public by default.
revoke all on function public.place_order(text, text, text, public.fulfilment_method, uuid, text, text, jsonb) from public;
grant execute on function public.place_order(text, text, text, public.fulfilment_method, uuid, text, text, jsonb)
  to anon, authenticated;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;