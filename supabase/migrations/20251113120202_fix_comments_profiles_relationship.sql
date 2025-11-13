-- Fix the relationship between comments and profiles
-- Add a proper foreign key constraint to comments.user_id referencing profiles.id

-- First, remove the existing foreign key constraint to auth.users
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

-- Add a foreign key constraint to profiles table
ALTER TABLE comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
