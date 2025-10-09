-- Add video_url column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN posts.video_url IS 'URL of the video uploaded with the post';
