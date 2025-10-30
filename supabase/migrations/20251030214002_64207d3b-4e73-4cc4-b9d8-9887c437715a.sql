-- Update process-scorecard-emails cron job from hourly to every 15 minutes
-- First, unschedule the old hourly job
SELECT cron.unschedule('process-scorecard-emails-hourly');

-- Create new 15-minute schedule
SELECT cron.schedule(
  'process-scorecard-emails-15min',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT
    net.http_post(
        url:='https://iyqsbjawaampgcavsgcz.supabase.co/functions/v1/process-scorecard-emails',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXNiamF3YWFtcGdjYXZzZ2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTI2MTgsImV4cCI6MjA2NjE2ODYxOH0.yOhYxzUyFYbxdu1neuagXqa2xXuhIAoWBYr3w0acNb0"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);