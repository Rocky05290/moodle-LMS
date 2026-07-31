-- ============================================================
--  Enable file uploads (lesson materials: PDF / video / slides)
--  Run ONCE in Supabase → SQL Editor → New query → RUN.
--  Creates a public "materials" bucket and lets logged-in
--  staff upload to it. (Reading is public via the file link.)
--  NOTE: this uses Supabase Storage (quick + free up to 1 GB).
--  For huge volumes we later migrate to Cloudflare R2.
--  Safe to run more than once.
-- ============================================================

-- 1) create the public bucket
insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do update set public = true;

-- 2) allow any logged-in user to upload files to it
drop policy if exists "materials_upload" on storage.objects;
create policy "materials_upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'materials');

-- 3) allow logged-in users to replace/update their uploads
drop policy if exists "materials_update" on storage.objects;
create policy "materials_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'materials');

-- 4) allow logged-in users to delete uploads (optional cleanup)
drop policy if exists "materials_delete" on storage.objects;
create policy "materials_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'materials');

-- 5) let anyone read files via the public link (public bucket)
drop policy if exists "materials_read" on storage.objects;
create policy "materials_read"
  on storage.objects for select to public
  using (bucket_id = 'materials');
