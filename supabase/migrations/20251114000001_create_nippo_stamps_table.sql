-- Create nippo_stamps table for article stamp functionality
CREATE TABLE nippo_stamps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nippo_id UUID REFERENCES nippo(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji VARCHAR(10) NOT NULL, -- Store emoji as string (e.g., "👍", "❤️", "😊")
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure one stamp per user per nippo per emoji
  UNIQUE(nippo_id, user_id, emoji)
);

-- Create indexes for better performance
CREATE INDEX nippo_stamps_nippo_id_idx ON nippo_stamps(nippo_id);
CREATE INDEX nippo_stamps_user_id_idx ON nippo_stamps(user_id);

-- Enable Row Level Security
ALTER TABLE nippo_stamps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Anyone can view stamps on public nippo
CREATE POLICY "Anyone can view nippo stamps" ON nippo_stamps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM nippo
      WHERE nippo.id = nippo_stamps.nippo_id
      AND (nippo.is_public = true OR nippo.user_id = auth.uid())
    )
  );

-- Authenticated users can add stamps to nippo they can see
CREATE POLICY "Authenticated users can add nippo stamps" ON nippo_stamps
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM nippo
      WHERE nippo.id = nippo_stamps.nippo_id
      AND (nippo.is_public = true OR nippo.user_id = auth.uid())
    )
  );

-- Users can remove their own stamps
CREATE POLICY "Users can remove own nippo stamps" ON nippo_stamps
  FOR DELETE USING (auth.uid() = user_id);

-- Update notification type to include nippo_stamp
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('comment', 'stamp', 'nippo_stamp'));

-- Create function to handle new nippo stamp notifications
CREATE OR REPLACE FUNCTION handle_new_nippo_stamp()
RETURNS TRIGGER AS $$
DECLARE
  nippo_author_id UUID;
  nippo_title TEXT;
  stamper_name TEXT;
BEGIN
  -- Get nippo author and title
  SELECT n.user_id, n.title 
  INTO nippo_author_id, nippo_title
  FROM nippo n
  WHERE n.id = NEW.nippo_id;
  
  -- Get stamper's name
  SELECT COALESCE(p.name, p.email)
  INTO stamper_name
  FROM profiles p
  WHERE p.id = NEW.user_id;
  
  -- Only send notification if the stamp is not from the nippo author
  IF nippo_author_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, message, nippo_id)
    VALUES (
      nippo_author_id,
      'nippo_stamp',
      '記事にスタンプが追加されました',
      COALESCE(stamper_name, '匿名ユーザー') || 'があなたの記事「' || COALESCE(nippo_title, '無題') || '」に' || NEW.emoji || 'スタンプを追加しました',
      NEW.nippo_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for nippo stamp notifications
CREATE TRIGGER handle_nippo_stamp_notification
  AFTER INSERT ON nippo_stamps
  FOR EACH ROW EXECUTE FUNCTION handle_new_nippo_stamp();