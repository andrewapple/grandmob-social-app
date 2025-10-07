-- Add RLS policy to allow all authenticated users to read profiles
-- This is needed for comments to display usernames

CREATE POLICY "Allow authenticated users to read all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (true);
