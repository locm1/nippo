-- Create comments table for nippo
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nippo_id UUID REFERENCES nippo(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX comments_nippo_id_idx ON comments(nippo_id);
CREATE INDEX comments_user_id_idx ON comments(user_id);
CREATE INDEX comments_created_at_idx ON comments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Anyone can view comments on public nippo
CREATE POLICY "Anyone can view comments on public nippo" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM nippo 
      WHERE nippo.id = comments.nippo_id 
      AND (nippo.is_public = true OR nippo.user_id = auth.uid())
    )
  );

-- Authenticated users can insert comments
CREATE POLICY "Authenticated users can insert comments" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM nippo 
      WHERE nippo.id = comments.nippo_id 
      AND (nippo.is_public = true OR nippo.user_id = auth.uid())
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER handle_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
