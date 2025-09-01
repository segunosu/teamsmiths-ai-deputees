-- Create project_proposals table for expert submissions
CREATE TABLE IF NOT EXISTS public.project_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES public.briefs(id),
  expert_id UUID NOT NULL,
  scope JSONB NOT NULL,
  price_total NUMERIC NOT NULL,
  milestones JSONB, -- [{"title":"Setup","amount":2000}, {"title":"Testing","amount":1500}]
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted','accepted','rejected')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on project_proposals
ALTER TABLE public.project_proposals ENABLE ROW LEVEL SECURITY;

-- Experts can view and manage their own proposals
CREATE POLICY "Experts can view their own proposals" 
ON public.project_proposals 
FOR SELECT 
USING (expert_id = auth.uid());

CREATE POLICY "Experts can create their own proposals" 
ON public.project_proposals 
FOR INSERT 
WITH CHECK (expert_id = auth.uid());

CREATE POLICY "Experts can update their own proposals" 
ON public.project_proposals 
FOR UPDATE 
USING (expert_id = auth.uid() AND status = 'submitted');

-- Admins can manage all proposals
CREATE POLICY "Admins can manage all proposals" 
ON public.project_proposals 
FOR ALL 
USING (is_admin(auth.uid()));

-- Clients can view proposals for their briefs
CREATE POLICY "Clients can view proposals for their briefs" 
ON public.project_proposals 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.briefs b 
  WHERE b.id = brief_id 
  AND (b.user_id = auth.uid() OR (b.org_id IS NOT NULL AND is_org_member(b.org_id, auth.uid())))
));

-- Extend projects table for assurance/retainers
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS assurance_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS assurance_plan TEXT, -- bronze/silver/gold
  ADD COLUMN IF NOT EXISTS assurance_started TIMESTAMPTZ;

-- Extend project_milestones table for QA workflow
ALTER TABLE public.project_milestones
  ADD COLUMN IF NOT EXISTS qa_status TEXT DEFAULT 'pending' CHECK (qa_status IN ('pending','passed','failed')),
  ADD COLUMN IF NOT EXISTS qa_checked_by UUID,
  ADD COLUMN IF NOT EXISTS qa_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed')),
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;

-- Add trigger to update updated_at on project_proposals
CREATE TRIGGER update_project_proposals_updated_at
BEFORE UPDATE ON public.project_proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_proposals_brief_id ON public.project_proposals(brief_id);
CREATE INDEX IF NOT EXISTS idx_project_proposals_expert_id ON public.project_proposals(expert_id);
CREATE INDEX IF NOT EXISTS idx_project_proposals_status ON public.project_proposals(status);
CREATE INDEX IF NOT EXISTS idx_projects_assurance_active ON public.projects(assurance_active);
CREATE INDEX IF NOT EXISTS idx_project_milestones_qa_status ON public.project_milestones(qa_status);
CREATE INDEX IF NOT EXISTS idx_project_milestones_payment_status ON public.project_milestones(payment_status);