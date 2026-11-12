-- =============================================================
-- Initial schema: catalogue, delivery zones, customers, orders
-- Money is stored in pence (integer). Measurements are metric
-- (mm, g); imperial conversion happens in the app.
-- =============================================================

-- ---------- Enums ----------
create type public.order_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type public.fulfilment_method as enum ('delivery', 'pickup');

-- ---------- updated_at helper ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Products (one row per cheesecake) ----------
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null check (length(trim(name)) > 0),
  description text,
  image_path  text,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- Product sizes (each size has its own price) ----------
create table public.product_sizes (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  label       text not null check (length(trim(label)) > 0),
  diameter_mm integer check (diameter_mm > 0),
  height_mm   integer check (height_mm > 0),
  weight_g    integer check (weight_g > 0),
  serves      integer check (serves > 0),
  price_pence integer not null check (price_pence >= 0),
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (product_id, label)
);

-- ---------- Delivery zones (fixed fee per zone) ----------
create table public.delivery_zones (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique check (length(trim(name)) > 0),
  description text,
  fee_pence   integer not null check (fee_pence >= 0),
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- Customers ----------
create table public.customers (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null check (length(trim(full_name)) > 0),
  phone      text not null check (length(trim(phone)) > 0),
  email      text,
  created_at timestamptz not null default now()
);

-- ---------- Orders ----------
create table public.orders (
  id                 uuid primary key default gen_random_uuid(),
  reference          text not null unique
                     default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  customer_id        uuid not null references public.customers (id) on delete restrict,
  fulfilment_method  public.fulfilment_method not null,
  delivery_zone_id   uuid references public.delivery_zones (id) on delete restrict,
  delivery_address   text,
  notes              text,
  status             public.order_status not null default 'pending',
  subtotal_pence     integer not null check (subtotal_pence >= 0),
  delivery_fee_pence integer not null default 0 check (delivery_fee_pence >= 0),
  discount_pence     integer not null default 0 check (discount_pence >= 0),
  total_pence        integer not null check (total_pence >= 0),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- Delivery orders need a zone and an address; pickup orders have no delivery fee.
  constraint orders_delivery_details_check check (
    (fulfilment_method = 'delivery'
       and delivery_zone_id is not null
       and delivery_address is not null
       and length(trim(delivery_address)) > 0)
    or
    (fulfilment_method = 'pickup'
       and delivery_zone_id is null
       and delivery_fee_pence = 0)
  ),
  -- The stored total must always add up.
  constraint orders_total_check check (
    total_pence = subtotal_pence + delivery_fee_pence - discount_pence
  )
);

-- ---------- Order items (snapshot of what was bought) ----------
create table public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders (id) on delete cascade,
  product_size_id  uuid references public.product_sizes (id) on delete set null,
  product_name     text not null,
  size_label       text not null,
  unit_price_pence integer not null check (unit_price_pence >= 0),
  quantity         integer not null check (quantity > 0),
  line_total_pence integer generated always as (unit_price_pence * quantity) stored,
  created_at       timestamptz not null default now()
);

-- ---------- Indexes on foreign keys and common filters ----------
create index product_sizes_product_id_idx on public.product_sizes (product_id);
create index orders_customer_id_idx       on public.orders (customer_id);
create index orders_delivery_zone_id_idx  on public.orders (delivery_zone_id);
create index orders_status_created_at_idx on public.orders (status, created_at desc);
create index order_items_order_id_idx     on public.order_items (order_id);
create index order_items_product_size_idx on public.order_items (product_size_id);

-- ---------- updated_at triggers ----------
create trigger products_set_updated_at       before update on public.products
  for each row execute function public.set_updated_at();
create trigger product_sizes_set_updated_at  before update on public.product_sizes
  for each row execute function public.set_updated_at();
create trigger delivery_zones_set_updated_at before update on public.delivery_zones
  for each row execute function public.set_updated_at();
create trigger orders_set_updated_at         before update on public.orders
  for each row execute function public.set_updated_at();