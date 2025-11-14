-- Create comment_stamps table for emoji stamp functionality
CREATE TABLE comment_stamps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji VARCHAR(10) NOT NULL, -- Store emoji as string (e.g., "👍", "❤️", "😊")
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure one stamp per user per comment per emoji
  UNIQUE(comment_id, user_id, emoji)
);

-- Create indexes for better performance
CREATE INDEX comment_stamps_comment_id_idx ON comment_stamps(comment_id);
CREATE INDEX comment_stamps_user_id_idx ON comment_stamps(user_id);

-- Enable Row Level Security
ALTER TABLE comment_stamps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Anyone can view stamps on comments they can see
CREATE POLICY "Anyone can view comment stamps" ON comment_stamps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM comments
      JOIN nippo ON comments.nippo_id = nippo.id
      WHERE comments.id = comment_stamps.comment_id
      AND (nippo.is_public = true OR nippo.user_id = auth.uid())
    )
  );

-- Authenticated users can add stamps to comments they can see
CREATE POLICY "Authenticated users can add stamps" ON comment_stamps
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM comments
      JOIN nippo ON comments.nippo_id = nippo.id
      WHERE comments.id = comment_stamps.comment_id
      AND (nippo.is_public = true OR nippo.user_id = auth.uid())
    )
  );

-- Users can remove their own stamps
CREATE POLICY "Users can remove own stamps" ON comment_stamps
  FOR DELETE USING (auth.uid() = user_id);

-- Update notification type to include stamp
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('comment', 'stamp'));

-- Create function to handle new stamp notifications
CREATE OR REPLACE FUNCTION handle_new_stamp()
RETURNS TRIGGER AS $$
DECLARE
  comment_author_id UUID;
  nippo_title TEXT;
  stamper_name TEXT;
BEGIN
  -- Get comment author and nippo info
  SELECT c.user_id, n.title 
  INTO comment_author_id, nippo_title
  FROM comments c
  JOIN nippo n ON c.nippo_id = n.id
  WHERE c.id = NEW.comment_id;
  
  -- Get stamper's name
  SELECT COALESCE(p.name, p.email)
  INTO stamper_name
  FROM profiles p
  WHERE p.id = NEW.user_id;
  
  -- Only send notification if the stamp is not from the comment author
  IF comment_author_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, message, nippo_id, comment_id)
    VALUES (
      comment_author_id,
      'stamp',
      'スタンプが追加されました',
      COALESCE(stamper_name, '匿名ユーザー') || 'があなたのコメントに' || NEW.emoji || 'スタンプを追加しました',
      (SELECT nippo_id FROM comments WHERE id = NEW.comment_id),
      NEW.comment_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stamp notifications
CREATE TRIGGER handle_comment_stamp_notification
  AFTER INSERT ON comment_stamps
  FOR EACH ROW EXECUTE FUNCTION handle_new_stamp();