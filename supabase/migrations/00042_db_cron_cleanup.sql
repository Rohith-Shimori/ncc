-- Enable pg_cron extension to schedule automated database maintenance tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Schedule a daily job to clean up notifications logs that are no longer needed
-- This keeps database storage within the 500MB Supabase Free Tier limit
SELECT cron.schedule(
  'daily-notifications-cleanup',
  '0 3 * * *', -- Run every day at 3:00 AM UTC
  $$
  DELETE FROM public.notifications 
  WHERE (is_read = true AND created_at < NOW() - INTERVAL '30 days')
     OR (is_read = false AND created_at < NOW() - INTERVAL '90 days')
  $$
);
