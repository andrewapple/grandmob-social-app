-- Create calendar_events table
create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  event_name text not null,
  event_date date not null,
  event_time time,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table calendar_events enable row level security;

-- RLS Policies for calendar_events
-- Everyone can view all events (family calendar)
create policy "Anyone can view calendar events"
  on calendar_events
  for select
  to authenticated
  using (true);

-- Users can insert their own events
create policy "Users can insert their own events"
  on calendar_events
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update their own events
create policy "Users can update their own events"
  on calendar_events
  for update
  to authenticated
  using (auth.uid() = user_id);

-- Users can delete their own events
create policy "Users can delete their own events"
  on calendar_events
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists calendar_events_date_idx on calendar_events(event_date);
create index if not exists calendar_events_user_id_idx on calendar_events(user_id);
