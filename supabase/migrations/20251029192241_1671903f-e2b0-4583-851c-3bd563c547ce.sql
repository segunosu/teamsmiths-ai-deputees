
-- Email automation tables for scorecard nurture workflows

-- Email templates for each segment and day
CREATE TABLE IF NOT EXISTS public.scorecard_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment TEXT NOT NULL, -- 'Explorer', 'Implementer', 'Accelerator'
  day_number INTEGER NOT NULL, -- 0, 2, 5, 10, etc.
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  cta_text TEXT,
  cta_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(segment, day_number)
);

-- Scheduled emails to be sent
CREATE TABLE IF NOT EXISTS public.scorecard_email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scorecard_id UUID NOT NULL REFERENCES public.scorecard_responses(id),
  template_id UUID NOT NULL REFERENCES public.scorecard_email_templates(id),
  to_email TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notifications/alerts configuration
CREATE TABLE IF NOT EXISTS public.scorecard_alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  condition_segment TEXT, -- null = all segments
  condition_min_score INTEGER,
  alert_type TEXT NOT NULL, -- 'slack', 'email', 'in_app'
  alert_target TEXT NOT NULL, -- slack webhook URL, email address, or user_id
  message_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Log of all automated actions
CREATE TABLE IF NOT EXISTS public.scorecard_automation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scorecard_id UUID NOT NULL REFERENCES public.scorecard_responses(id),
  action_type TEXT NOT NULL, -- 'email_queued', 'alert_sent', 'status_updated'
  action_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'success',
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON public.scorecard_email_queue(scheduled_for, status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scorecard ON public.scorecard_email_queue(scorecard_id);
CREATE INDEX IF NOT EXISTS idx_automation_log_scorecard ON public.scorecard_automation_log(scorecard_id);

-- Enable RLS
ALTER TABLE public.scorecard_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorecard_email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorecard_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorecard_automation_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin only for configuration, system for automation)
CREATE POLICY "Admin can manage email templates"
  ON public.scorecard_email_templates FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admin can view email queue"
  ON public.scorecard_email_queue FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admin can manage alert rules"
  ON public.scorecard_alert_rules FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admin can view automation log"
  ON public.scorecard_automation_log FOR SELECT
  USING (is_admin(auth.uid()));

-- Function to queue nurture emails when scorecard is submitted
CREATE OR REPLACE FUNCTION public.queue_scorecard_nurture_emails()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  template_record RECORD;
  send_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get all active templates for this segment
  FOR template_record IN 
    SELECT * FROM public.scorecard_email_templates 
    WHERE segment = NEW.segment 
    AND is_active = true
    ORDER BY day_number
  LOOP
    -- Calculate send date (created_at + day_number days)
    send_date := NEW.created_at + (template_record.day_number || ' days')::INTERVAL;
    
    -- Queue the email
    INSERT INTO public.scorecard_email_queue (
      scorecard_id,
      template_id,
      to_email,
      scheduled_for
    ) VALUES (
      NEW.id,
      template_record.id,
      NEW.email,
      send_date
    );
  END LOOP;
  
  -- Log the automation
  INSERT INTO public.scorecard_automation_log (
    scorecard_id,
    action_type,
    action_data
  ) VALUES (
    NEW.id,
    'nurture_emails_queued',
    jsonb_build_object('segment', NEW.segment, 'template_count', (SELECT COUNT(*) FROM public.scorecard_email_templates WHERE segment = NEW.segment AND is_active = true))
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-queue emails on new scorecard
CREATE TRIGGER trigger_queue_nurture_emails
  AFTER INSERT ON public.scorecard_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_scorecard_nurture_emails();

-- Insert default email templates for each segment
INSERT INTO public.scorecard_email_templates (segment, day_number, subject, body_html, cta_text, cta_url) VALUES
-- Explorer templates
('Explorer', 0, 'Your AI Impact Score: {{total_score}}/100 🎯', '<p>Hi {{name}},</p><p>Thanks for completing the AI Impact Scorecard! Your score places you in the <strong>Explorer</strong> segment.</p>', 'Book Free Workshop', 'https://teamsmiths.ai/start?interest=workshop&origin=scorecard'),
('Explorer', 2, 'Ready to Start Your AI Journey?', '<p>Hi {{name}},</p><p>We noticed you scored {{total_score}}/100 on your AI readiness assessment.</p><p>Join our free workshop to learn AI fundamentals and identify your first use cases.</p>', 'Reserve Your Spot', 'https://teamsmiths.ai/start?interest=workshop&origin=scorecard'),
('Explorer', 5, 'Your Free AI Readiness Guide', '<p>Hi {{name}},</p><p>We''ve prepared a comprehensive guide to help you get started with AI in your organization.</p>', 'Download Guide', 'https://teamsmiths.ai/resources'),
('Explorer', 10, 'Case Study: Getting Started with AI', '<p>Hi {{name}},</p><p>See how companies like yours successfully launched their AI initiatives.</p>', 'Read Case Study', 'https://teamsmiths.ai/business-impact'),

-- Implementer templates
('Implementer', 0, 'Your AI Impact Score: {{total_score}}/100 🚀', '<p>Hi {{name}},</p><p>Congratulations! Your score places you in the <strong>Implementer</strong> segment - you''re making real progress with AI.</p>', 'Join Growth Sprint', 'https://teamsmiths.ai/start?interest=sprint&origin=scorecard'),
('Implementer', 1, 'Accelerate Your AI Growth', '<p>Hi {{name}},</p><p>With your score of {{total_score}}/100, you''re ready to scale your AI initiatives.</p><p>Our Growth Sprint helps organizations like yours move from pilots to production.</p>', 'Learn About Sprint', 'https://teamsmiths.ai/start?interest=sprint&origin=scorecard'),
('Implementer', 3, 'Scaling AI in Your Organization', '<p>Hi {{name}},</p><p>Discover proven strategies for scaling successful AI pilots across your departments.</p>', 'Access Resource', 'https://teamsmiths.ai/resources'),
('Implementer', 7, 'From Pilot to Production Success Story', '<p>Hi {{name}},</p><p>Learn how organizations scaled their AI from proof-of-concept to enterprise-wide deployment.</p>', 'Read Success Story', 'https://teamsmiths.ai/business-impact'),

-- Accelerator templates
('Accelerator', 0, 'Impressive! Your AI Score: {{total_score}}/100 🏆', '<p>Hi {{name}},</p><p>Your score places you in the elite <strong>Accelerator</strong> segment. Let''s discuss how to maximize your AI ROI.</p>', 'Book Strategy Call', 'https://calendly.com/osu/brief-chat'),
('Accelerator', 1, 'Let''s Drive Strategic AI Innovation', '<p>Hi {{name}},</p><p>With your advanced AI maturity ({{total_score}}/100), you''re positioned to lead in your industry.</p><p>I''d love to discuss specific opportunities for your organization.</p>', 'Schedule Call', 'https://calendly.com/osu/brief-chat'),
('Accelerator', 3, 'Enterprise AI Transformation Case Study', '<p>Hi {{name}},</p><p>See how industry leaders are using AI to create competitive advantages and drive innovation.</p>', 'View Case Study', 'https://teamsmiths.ai/business-impact')
ON CONFLICT (segment, day_number) DO NOTHING;

-- Insert default alert rules
INSERT INTO public.scorecard_alert_rules (name, condition_segment, condition_min_score, alert_type, alert_target, message_template, is_active) VALUES
('Hot Lead Alert', 'Accelerator', 70, 'in_app', 'admin', '🔥 New hot lead: {{name}} from {{company}} scored {{total_score}}/100', true),
('High Score Alert', NULL, 85, 'in_app', 'admin', '⭐ Exceptional score: {{name}} scored {{total_score}}/100', true)
ON CONFLICT DO NOTHING;
