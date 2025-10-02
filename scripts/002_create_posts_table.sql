-- Create posts table
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  image_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint posts_content_or_image check (
    content is not null or image_url is not null
  )
);

-- Enable RLS
alter table public.posts enable row level security;

-- RLS Policies for posts
-- Everyone can view all posts (family app)
create policy "posts_select_all"
  on public.posts for select
  using (true);

-- Users can only insert their own posts
create policy "posts_insert_own"
  on public.posts for insert
  with check (auth.uid() = author_id);

-- Users can only update their own posts
create policy "posts_update_own"
  on public.posts for update
  using (auth.uid() = author_id);

-- Users can only delete their own posts
create policy "posts_delete_own"
  on public.posts for delete
  using (auth.uid() = author_id);

-- Create index for faster queries
create index if not exists posts_author_id_idx on public.posts(author_id);
create index if not exists posts_created_at_idx on public.posts(created_at desc);
