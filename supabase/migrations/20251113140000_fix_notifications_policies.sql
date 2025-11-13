-- Add missing INSERT policy for notifications table
create policy "System can insert notifications" on notifications
  for insert with check (true);

-- Update the function to use SECURITY DEFINER to bypass RLS
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
$$ language plpgsql security definer;