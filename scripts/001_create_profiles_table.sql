-- Create profiles table that references auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies for profiles
-- Users can view all profiles (it's a family app)
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

-- Users can only insert their own profile
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can only update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Users can only delete their own profile
create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);
