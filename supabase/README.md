# Supabase

Database schema, Row Level Security (RLS) policies, storage configuration and seed data for Abigail's Cheesecakes.

## Layout

| Path          | Purpose                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------- |
| `migrations/` | Ordered SQL migrations. Applied migrations are never edited; changes go in a new migration.   |
| `seed.sql`    | Placeholder catalogue (3 cheesecakes, 6 sizes, 2 delivery zones). Safe to run more than once. |
| `config.toml` | Supabase CLI configuration.                                                                   |

## Applying to a project

```bash
pnpm exec supabase login
pnpm exec supabase link --project-ref <project-ref>
pnpm exec supabase db push --remote --include-seed
```

Regenerate TypeScript types after any schema change:

```bash
pnpm exec supabase gen types typescript --remote --schema public > packages/database/src/types.generated.ts
```

## Security model

RLS is the security boundary: authorization is enforced by Postgres, not by application code. RLS is enabled on every table, and new tables are not auto-exposed to the API; access is granted explicitly in migrations.

**Roles**

- **Visitor** (`anon` role, publishable key): anyone browsing the storefront.
- **Admin**: a signed-in user whose `app_metadata.role` is `admin`. `app_metadata` can only be set server-side, so users cannot grant themselves the role. Checked by `public.is_admin()`.

**Table policies**

| Table            | Visitor                              | Admin       |
| ---------------- | ------------------------------------ | ----------- |
| `products`       | Read active rows                     | Full access |
| `product_sizes`  | Read active sizes of active products | Full access |
| `delivery_zones` | Read active rows                     | Full access |
| `customers`      | No access                            | Full access |
| `orders`         | No access                            | Full access |
| `order_items`    | No access                            | Full access |

**Placing orders**

Visitors have no direct write access to any table. Orders are created only through the `public.place_order(...)` function, which:

- validates that every item is an active size of an active product, with a quantity of 1–20;
- validates the delivery zone for delivery orders;
- reads prices and delivery fees from the database, never from the client;
- writes the customer, order and order items in a single transaction;
- returns the order reference for the WhatsApp handoff.

It runs as `security definer` with an empty `search_path` to prevent search-path hijacking.

**Data integrity (enforced by constraints)**

- Money is stored in pence as integers; measurements in mm and grams.
- Delivery orders must have a zone and an address; pickup orders cannot have a delivery fee.
- `total_pence` must equal `subtotal_pence + delivery_fee_pence - discount_pence`.
- Order items store a snapshot of the product name, size and price at the time of ordering.

**Storage**

The `product-images` bucket is public for reading by URL (needed by the storefront) but cannot be listed by visitors. Only admins can upload, replace or delete files. Uploads are limited to JPEG, PNG and WebP, up to 5 MB each.
