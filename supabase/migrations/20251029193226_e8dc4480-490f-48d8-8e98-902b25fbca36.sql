
-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule email processing every hour
SELECT cron.schedule(
  'process-scorecard-emails-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://iyqsbjawaampgcavsgcz.supabase.co/functions/v1/process-scorecard-emails',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXNiamF3YWFtcGdjYXZzZ2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTI2MTgsImV4cCI6MjA2NjE2ODYxOH0.yOhYxzUyFYbxdu1neuagXqa2xXuhIAoWBYr3w0acNb0"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Verify cron job was created
SELECT * FROM cron.job WHERE jobname = 'process-scorecard-emails-hourly';
