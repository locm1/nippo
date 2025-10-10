-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create nippo table
create table nippo (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  images text[]
);

-- Create indexes for better performance
create index nippo_user_id_idx on nippo(user_id);
create index nippo_created_at_idx on nippo(created_at desc);
create index nippo_is_public_idx on nippo(is_public);

-- Enable Row Level Security
alter table nippo enable row level security;

-- Create policies
-- Users can view their own nippo
create policy "Users can view own nippo" on nippo
  for select using (auth.uid() = user_id);

-- Users can insert their own nippo
create policy "Users can insert own nippo" on nippo
  for insert with check (auth.uid() = user_id);

-- Users can update their own nippo
create policy "Users can update own nippo" on nippo
  for update using (auth.uid() = user_id);

-- Users can delete their own nippo
create policy "Users can delete own nippo" on nippo
  for delete using (auth.uid() = user_id);

-- Anyone can view public nippo (for sharing functionality)
create policy "Anyone can view public nippo" on nippo
  for select using (is_public = true);

-- Create updated_at trigger function
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_nippo_updated_at
  before update on nippo
  for each row execute function handle_updated_at();

-- Create storage bucket for nippo images
insert into storage.buckets (id, name) values ('nippo-images', 'nippo-images');

-- Create storage policies
create policy "Users can upload nippo images" on storage.objects
  for insert with check (
    bucket_id = 'nippo-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view nippo images" on storage.objects
  for select using (bucket_id = 'nippo-images');

create policy "Users can update their nippo images" on storage.objects
  for update using (
    bucket_id = 'nippo-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their nippo images" on storage.objects
  for delete using (
    bucket_id = 'nippo-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );