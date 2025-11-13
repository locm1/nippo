-- Update comments table policies to work with profiles
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view comments on public nippo" ON comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- Recreate policies with better integration
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
