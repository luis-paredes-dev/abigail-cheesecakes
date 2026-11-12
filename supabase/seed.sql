-- =============================================================
-- Seed data: sample cheesecakes, sizes and delivery zones.
-- Placeholder content; prices in pence, measurements in mm / g.
-- Safe to run more than once (fixed ids + on conflict do nothing).
-- =============================================================

insert into public.products (id, slug, name, description, sort_order) values
  ('11111111-1111-4111-8111-000000000001', 'new-york-classic', 'New York Classic',
   'Dense, creamy baked cheesecake on a buttery biscuit base.', 1),
  ('11111111-1111-4111-8111-000000000002', 'basque-burnt', 'Basque Burnt',
   'Crustless, caramelised top with a soft, custardy centre.', 2),
  ('11111111-1111-4111-8111-000000000003', 'biscoff', 'Biscoff',
   'Spiced caramel biscuit base with a Biscoff swirl and crumb topping.', 3)
on conflict (id) do nothing;

insert into public.product_sizes
  (id, product_id, label, diameter_mm, height_mm, weight_g, serves, price_pence, sort_order) values
  ('22222222-2222-4222-8222-000000000001', '11111111-1111-4111-8111-000000000001', '6-inch', 152, 70,  900, 6,  2200, 1),
  ('22222222-2222-4222-8222-000000000002', '11111111-1111-4111-8111-000000000001', '8-inch', 203, 75, 1600, 10, 3200, 2),
  ('22222222-2222-4222-8222-000000000003', '11111111-1111-4111-8111-000000000002', '6-inch', 152, 80,  950, 6,  2400, 1),
  ('22222222-2222-4222-8222-000000000004', '11111111-1111-4111-8111-000000000002', '8-inch', 203, 85, 1700, 10, 3500, 2),
  ('22222222-2222-4222-8222-000000000005', '11111111-1111-4111-8111-000000000003', '6-inch', 152, 75,  950, 6,  2500, 1),
  ('22222222-2222-4222-8222-000000000006', '11111111-1111-4111-8111-000000000003', '8-inch', 203, 80, 1700, 10, 3600, 2)
on conflict (id) do nothing;

insert into public.delivery_zones (id, name, description, fee_pence, sort_order) values
  ('33333333-3333-4333-8333-000000000001', 'Local (up to 2 miles)', 'Bike delivery within 2 miles.', 300, 1),
  ('33333333-3333-4333-8333-000000000002', 'Extended (2–4 miles)',  'Bike delivery from 2 to 4 miles.', 500, 2)
on conflict (id) do nothing;