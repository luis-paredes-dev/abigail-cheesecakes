-- =============================================================
-- Recreate place_order with optional arguments defaulting to null,
-- so generated TypeScript types mark them as optional.
-- Required args first; optional args (with defaults) last.
-- =============================================================

drop function if exists public.place_order(
  text, text, text, public.fulfilment_method, uuid, text, text, jsonb
);

create function public.place_order(
  p_full_name         text,
  p_phone             text,
  p_fulfilment_method public.fulfilment_method,
  p_items             jsonb,
  p_email             text default null,
  p_delivery_zone_id  uuid default null,
  p_delivery_address  text default null,
  p_notes             text default null
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
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Items must be an array';
  end if;
  v_item_count := jsonb_array_length(p_items);
  if v_item_count = 0 or v_item_count > 50 then
    raise exception 'Order must contain between 1 and 50 items';
  end if;

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

revoke all on function public.place_order(
  text, text, public.fulfilment_method, jsonb, text, uuid, text, text
) from public;
grant execute on function public.place_order(
  text, text, public.fulfilment_method, jsonb, text, uuid, text, text
) to anon, authenticated;