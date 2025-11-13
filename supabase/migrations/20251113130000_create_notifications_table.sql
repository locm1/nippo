-- Create notifications table
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('comment')),
  title text not null,
  message text not null,
  nippo_id uuid references nippo(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index notifications_user_id_idx on notifications(user_id);
create index notifications_created_at_idx on notifications(created_at desc);
create index notifications_is_read_idx on notifications(is_read);

-- Enable Row Level Security
alter table notifications enable row level security;

-- Create policies
-- Users can view their own notifications
create policy "Users can view own notifications" on notifications
  for select using (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
create policy "Users can update own notifications" on notifications
  for update using (auth.uid() = user_id);

-- Function to create notification when comment is added
create or replace function handle_new_comment()
returns trigger as $$
begin
  -- Get the nippo author's user_id
  insert into notifications (user_id, type, title, message, nippo_id, comment_id)
  select 
    n.user_id,
    'comment',
    '新しいコメント',
    'あなたの日報にコメントが投稿されました',
    new.nippo_id,
    new.id
  from nippo n
  where n.id = new.nippo_id
    and n.user_id != new.user_id; -- Don't notify self

  return new;
end;
$$ language plpgsql;

-- Create trigger for new comments
create trigger handle_new_comment_notification
  after insert on comments
  for each row execute function handle_new_comment();