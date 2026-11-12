-- =============================================================
-- Storage: public bucket for product images.
-- Anyone can view images via their public URL (needed for the
-- storefront); only admins can upload, replace or delete them.
-- =============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,  -- 5 MB per file
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Public buckets serve files by URL without a select policy, so visitors
-- can view images but cannot list the bucket's contents.
-- Admins get full management rights within this bucket only.

create policy "Admins can list product images"
  on storage.objects for select to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

create policy "Admins can upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "Admins can update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "Admins can delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));