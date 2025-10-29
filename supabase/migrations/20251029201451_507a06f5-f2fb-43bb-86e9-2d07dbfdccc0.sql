-- Create cron job to process email outbox every 5 minutes
SELECT cron.schedule(
  'process-email-outbox-every-5min',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://iyqsbjawaampgcavsgcz.supabase.co/functions/v1/process-email-outbox',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXNiamF3YWFtcGdjYXZzZ2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTI2MTgsImV4cCI6MjA2NjE2ODYxOH0.yOhYxzUyFYbxdu1neuagXqa2xXuhIAoWBYr3w0acNb0"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);