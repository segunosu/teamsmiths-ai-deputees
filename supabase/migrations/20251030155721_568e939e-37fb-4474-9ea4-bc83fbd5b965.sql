-- Add subject and body columns to email_outbox table
ALTER TABLE public.email_outbox 
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS body TEXT;

-- Update existing rows to extract subject and body from payload
UPDATE public.email_outbox 
SET 
  subject = payload->>'subject',
  body = payload->>'html'
WHERE payload IS NOT NULL 
AND subject IS NULL;

-- The payload column can remain for backward compatibility but is no longer required
-- Add comment to clarify the new structure
COMMENT ON COLUMN public.email_outbox.subject IS 'Email subject line (replaces payload.subject)';
COMMENT ON COLUMN public.email_outbox.body IS 'Email HTML body (replaces payload.html)';