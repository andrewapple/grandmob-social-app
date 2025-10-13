-- Add username column if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Fill in any missing usernames so we can safely enforce NOT NULL
UPDATE profiles
SET username = CONCAT('user_', gen_random_uuid()::text)
WHERE username IS NULL;

-- Now safely enforce constraints
ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key ON profiles(username);
