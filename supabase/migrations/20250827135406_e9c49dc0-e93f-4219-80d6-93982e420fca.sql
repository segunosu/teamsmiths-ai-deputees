-- Create AI-first matching setting and check existing projects table
INSERT INTO admin_settings (setting_key, setting_value) VALUES 
('ai_first_matching', 'true'::jsonb) 
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- Check if projects table exists with different structure and add missing columns
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS brief_id UUID REFERENCES public.briefs(id) ON DELETE CASCADE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS expert_user_id UUID;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client_user_id UUID;

-- Update RLS policies for projects to handle both old and new column names
DROP POLICY IF EXISTS "View projects (participants or admin)" ON public.projects;
CREATE POLICY "View projects (participants or admin)" ON public.projects
FOR SELECT USING (
  is_admin(auth.uid()) OR 
  COALESCE(expert_user_id, teamsmith_user_id) = auth.uid() OR 
  client_user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.project_participants pp 
    WHERE pp.project_id = projects.id AND pp.user_id = auth.uid()
  )
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
    AND (
      COALESCE(p.expert_user_id, p.teamsmith_user_id) = auth.uid() OR 
      p.client_user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.project_participants pp 
        WHERE pp.project_id = p.id AND pp.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Create project messages (participants or admin)" ON public.project_messages
FOR INSERT WITH CHECK (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_messages.project_id 
    AND (
      COALESCE(p.expert_user_id, p.teamsmith_user_id) = auth.uid() OR 
      p.client_user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.project_participants pp 
        WHERE pp.project_id = p.id AND pp.user_id = auth.uid()
      )
    )
  )
);

-- Update expert_invites to add more response tracking
ALTER TABLE public.expert_invites ADD COLUMN IF NOT EXISTS acceptance_metadata JSONB DEFAULT '{}';