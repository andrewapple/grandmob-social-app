-- Enable RLS on comments table if not already enabled
alter table comments enable row level security;

-- Allow users to read all comments
create policy "Anyone can view comments"
  on comments for select
  using (true);

-- Allow authenticated users to insert their own comments
create policy "Users can insert their own comments"
  on comments for insert
  with check (auth.uid() = author_id);

-- Allow users to update their own comments
create policy "Users can update their own comments"
  on comments for update
  using (auth.uid() = author_id);

-- Allow users to delete their own comments
create policy "Users can delete their own comments"
  on comments for delete
  using (auth.uid() = author_id);

-- Enable RLS on comment_likes table if not already enabled
alter table comment_likes enable row level security;

-- Allow users to view all comment likes
create policy "Anyone can view comment likes"
  on comment_likes for select
  using (true);

-- Allow authenticated users to insert their own likes
create policy "Users can insert their own comment likes"
  on comment_likes for insert
  with check (auth.uid() = user_id);

-- Allow users to delete their own likes
create policy "Users can delete their own comment likes"
  on comment_likes for delete
  using (auth.uid() = user_id);
