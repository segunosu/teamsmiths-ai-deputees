-- Admin roles and threshold configuration
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default threshold setting
INSERT INTO public.admin_settings (setting_key, setting_value) 
VALUES ('quote_approval_threshold', '{"amount": 5000, "currency": "gbp"}');

-- Enhanced deliverables system
CREATE TABLE public.project_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'approved', 'rejected', 'revision_requested')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Deliverable files/versions
CREATE TABLE public.deliverable_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID NOT NULL REFERENCES public.project_deliverables(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  storage_path TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Notifications system
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('quote_received', 'quote_approved', 'payment_confirmed', 'deliverable_submitted', 'deliverable_approved', 'deliverable_rejected', 'project_completed', 'admin_review_required')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID, -- Can reference project, quote, deliverable etc
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverable_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Admin settings policies
CREATE POLICY "Admins can manage settings" ON public.admin_settings
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Everyone can view settings" ON public.admin_settings
  FOR SELECT USING (true);

-- Project deliverables policies
CREATE POLICY "View deliverables (participants or admin)" ON public.project_deliverables
  FOR SELECT USING (is_admin(auth.uid()) OR is_project_participant(project_id, auth.uid()));

CREATE POLICY "Update deliverables (participants or admin)" ON public.project_deliverables
  FOR UPDATE USING (is_admin(auth.uid()) OR is_project_participant(project_id, auth.uid()));

CREATE POLICY "Insert deliverables (participants or admin)" ON public.project_deliverables
  FOR INSERT WITH CHECK (is_admin(auth.uid()) OR is_project_participant(project_id, auth.uid()));

-- Deliverable files policies
CREATE POLICY "View deliverable files (participants or admin)" ON public.deliverable_files
  FOR SELECT USING (
    is_admin(auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM public.project_deliverables pd 
      WHERE pd.id = deliverable_files.deliverable_id 
      AND is_project_participant(pd.project_id, auth.uid())
    )
  );

CREATE POLICY "Upload deliverable files (participants or admin)" ON public.deliverable_files
  FOR INSERT WITH CHECK (
    is_admin(auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM public.project_deliverables pd 
      WHERE pd.id = deliverable_files.deliverable_id 
      AND is_project_participant(pd.project_id, auth.uid())
    )
  );

-- Notifications policies
CREATE POLICY "View own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Insert notifications (system)" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_project_deliverables_updated_at
  BEFORE UPDATE ON public.project_deliverables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_related_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_related_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;