-- Create AI-first matching setting and project creation table
INSERT INTO admin_settings (setting_key, setting_value) VALUES 
('ai_first_matching', 'true'::jsonb) 
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- Create projects table for active projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID REFERENCES public.briefs(id) ON DELETE CASCADE,
  expert_user_id UUID NOT NULL,
  client_user_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  start_date TIMESTAMPTZ DEFAULT now(),
  deadline DATE,
  budget_amount INTEGER,
  currency TEXT DEFAULT 'gbp',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS policies for projects
CREATE POLICY "View projects (participants or admin)" ON public.projects
FOR SELECT USING (
  is_admin(auth.uid()) OR 
  expert_user_id = auth.uid() OR 
  client_user_id = auth.uid()
);

CREATE POLICY "Create projects (admin only)" ON public.projects
FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Update projects (participants or admin)" ON public.projects
FOR UPDATE USING (
  is_admin(auth.uid()) OR 
  expert_user_id = auth.uid() OR 
  client_user_id = auth.uid()
);

-- Create project messages table for chat
CREATE TABLE IF NOT EXISTS public.project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for project messages
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for project messages
CREATE POLICY "View project messages (participants or admin)" ON public.project_messages
FOR SELECT USING (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_messages.project_id 
    AND (p.expert_user_id = auth.uid() OR p.client_user_id = auth.uid())
  )
);

CREATE POLICY "Create project messages (participants or admin)" ON public.project_messages
FOR INSERT WITH CHECK (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_messages.project_id 
    AND (p.expert_user_id = auth.uid() OR p.client_user_id = auth.uid())
  )
);

-- Create project milestones table  
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  deliverables JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for project milestones
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

-- RLS policies for project milestones
CREATE POLICY "View project milestones (participants or admin)" ON public.project_milestones
FOR SELECT USING (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_milestones.project_id 
    AND (p.expert_user_id = auth.uid() OR p.client_user_id = auth.uid())
  )
);

CREATE POLICY "Update project milestones (participants or admin)" ON public.project_milestones
FOR UPDATE USING (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_milestones.project_id 
    AND (p.expert_user_id = auth.uid() OR p.client_user_id = auth.uid())
  )
);

-- Update expert_invites to add more response tracking
ALTER TABLE public.expert_invites ADD COLUMN IF NOT EXISTS acceptance_metadata JSONB DEFAULT '{}';

-- Add trigger to update updated_at on projects and project_milestones
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_milestones_updated_at
  BEFORE UPDATE ON public.project_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();