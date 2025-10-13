-- Add username column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Make username unique and not null
ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key ON profiles(username);

-- Add RLS policy for username (everyone can read, only owner can update)
-- Note: The existing RLS policies should already cover this, but we'll ensure it's explicit
