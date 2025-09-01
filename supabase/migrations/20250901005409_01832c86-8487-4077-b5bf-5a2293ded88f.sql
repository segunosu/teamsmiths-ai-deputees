-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create autopilot matching cron job (every 15 minutes)
SELECT cron.schedule(
  'auto-match-briefs-15min',
  '*/15 * * * *', -- every 15 minutes
  $$
  SELECT
    net.http_post(
        url:='https://iyqsbjawaampgcavsgcz.supabase.co/functions/v1/auto-match-pending-briefs',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXNiamF3YWFtcGdjYXZzZ2N6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDU5MjYxOCwiZXhwIjoyMDY2MTY4NjE4fQ.FY5vQAZYuFHMC4a3QNvDWm1Cc-KwtOpMN5D2iS1tytY"}'::jsonb,
        body:=concat('{"scheduled": true, "timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Add autopilot settings to admin_settings if not exists
INSERT INTO public.admin_settings (setting_key, setting_value, updated_at, updated_by)
VALUES 
  ('autopilot_enabled', 'true'::jsonb, now(), '00000000-0000-0000-0000-000000000000'::uuid),
  ('autopilot_frequency_minutes', '15'::jsonb, now(), '00000000-0000-0000-0000-000000000000'::uuid)
ON CONFLICT (setting_key) DO NOTHING;

-- Create notification templates for autopilot
INSERT INTO public.admin_settings (setting_key, setting_value, updated_at, updated_by)
VALUES 
  ('notification_templates', '{
    "freelancer_invited": {
      "email_subject": "You''ve been invited to a new project",
      "email_template": "freelancer_invited",
      "in_app_message": "You''ve been invited to {{project_title}} because your skills match the client''s needs."
    },
    "client_confirmation": {
      "email_subject": "Your project is being matched with experts", 
      "email_template": "client_confirmation",
      "in_app_message": "We''ve invited {{expert_count}} experts who match your requirements. Expect proposals within 48 hours."
    },
    "freelancer_reminder_48h": {
      "email_subject": "Reminder: Your project invitation is waiting",
      "email_template": "freelancer_reminder",
      "in_app_message": "You''ve been invited but haven''t responded. Please accept or decline so we can notify the client."
    },
    "client_reminder_72h": {
      "email_subject": "Still waiting for proposals",
      "email_template": "client_reminder", 
      "in_app_message": "No expert has submitted yet. We''ll extend invitations or suggest next steps."
    }
  }'::jsonb, now(), '00000000-0000-0000-0000-000000000000'::uuid)
ON CONFLICT (setting_key) DO UPDATE SET setting_value = excluded.setting_value;