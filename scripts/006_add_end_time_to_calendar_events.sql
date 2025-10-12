-- Add end_time column to calendar_events table
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS end_time TIME;
