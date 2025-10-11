-- Create wishlist_items table
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  item text not null,
  description text,
  link text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.wishlist_items enable row level security;

-- RLS Policies for wishlist_items
-- Anyone can view wishlist items
create policy "Wishlist items are viewable by everyone"
  on public.wishlist_items
  for select
  to authenticated
  using (true);

-- Users can insert their own wishlist items
create policy "Users can insert their own wishlist items"
  on public.wishlist_items
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update their own wishlist items
create policy "Users can update their own wishlist items"
  on public.wishlist_items
  for update
  to authenticated
  using (auth.uid() = user_id);

-- Users can delete their own wishlist items
create policy "Users can delete their own wishlist items"
  on public.wishlist_items
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists wishlist_items_user_id_idx on public.wishlist_items(user_id);
create index if not exists wishlist_items_created_at_idx on public.wishlist_items(created_at desc);
