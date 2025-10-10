-- Drop existing storage policies
drop policy if exists "Users can upload nippo images" on storage.objects;
drop policy if exists "Users can view nippo images" on storage.objects;
drop policy if exists "Users can update their nippo images" on storage.objects;
drop policy if exists "Users can delete their nippo images" on storage.objects;

-- Create improved storage policies
create policy "Users can upload nippo images"
on storage.objects for insert
with check (
  bucket_id = 'nippo-images' AND
  auth.uid() is not null AND
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Public can view nippo images"
on storage.objects for select
using (bucket_id = 'nippo-images');

create policy "Users can update own nippo images"
on storage.objects for update
using (
  bucket_id = 'nippo-images' AND
  auth.uid() is not null AND
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own nippo images"
on storage.objects for delete
using (
  bucket_id = 'nippo-images' AND
  auth.uid() is not null AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Ensure the bucket exists
insert into storage.buckets (id, name) 
values ('nippo-images', 'nippo-images')
on conflict (id) do nothing;