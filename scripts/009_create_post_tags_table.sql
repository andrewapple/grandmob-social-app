-- 009_create_post_tags_table.sql
CREATE TABLE IF NOT EXISTS post_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  tagged_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
