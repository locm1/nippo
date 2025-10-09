-- Ensure the storage bucket exists
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'nippo-images', 
  'nippo-images', 
  true,
  52428800, -- 50MB
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Drop all existing policies first
drop policy if exists "Users can upload nippo images" on storage.objects;
drop policy if exists "Public can view nippo images" on storage.objects;
drop policy if exists "Users can view nippo images" on storage.objects;
drop policy if exists "Users can update own nippo images" on storage.objects;
drop policy if exists "Users can update their nippo images" on storage.objects;
drop policy if exists "Users can delete own nippo images" on storage.objects;
drop policy if exists "Users can delete their nippo images" on storage.objects;

-- Create simple, permissive policies for testing
create policy "Allow authenticated uploads"
on storage.objects for insert
with check (
  bucket_id = 'nippo-images' AND
  auth.role() = 'authenticated'
);

create policy "Allow public reads"
on storage.objects for select
using (bucket_id = 'nippo-images');

create policy "Allow authenticated updates"
on storage.objects for update
using (
  bucket_id = 'nippo-images' AND
  auth.role() = 'authenticated'
);

create policy "Allow authenticated deletes"
on storage.objects for delete
using (
  bucket_id = 'nippo-images' AND
  auth.role() = 'authenticated'
);