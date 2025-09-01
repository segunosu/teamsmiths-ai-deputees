-- 1) Email outbox (email audit)
CREATE TABLE IF NOT EXISTS public.email_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  template_code TEXT NOT NULL,
  payload JSONB NOT NULL,
  provider_id TEXT,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued','sent','failed')),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS email_outbox_admin ON public.email_outbox;
CREATE POLICY email_outbox_admin ON public.email_outbox FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 2) In-app notifications (update existing table if exists)
DO $$ 
BEGIN
  -- Check if notifications table exists and has the right structure
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    CREATE TABLE public.notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      cta_text TEXT,
      cta_url TEXT,
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  ELSE
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'cta_text') THEN
      ALTER TABLE public.notifications ADD COLUMN cta_text TEXT;
    END IF;
    IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'cta_url') THEN
      ALTER TABLE public.notifications ADD COLUMN cta_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'body') THEN
      ALTER TABLE public.notifications ADD COLUMN body TEXT;
    END IF;
  END IF;
END $$;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notif_self ON public.notifications;
DROP POLICY IF EXISTS notif_insert_self ON public.notifications;
DROP POLICY IF EXISTS notif_update_self ON public.notifications;

CREATE POLICY notif_self ON public.notifications
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY notif_insert_self ON public.notifications
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY notif_update_self ON public.notifications
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- 3) Automations audit
CREATE TABLE IF NOT EXISTS public.automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  result JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS auto_admin ON public.automation_runs;
CREATE POLICY auto_admin ON public.automation_runs FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));