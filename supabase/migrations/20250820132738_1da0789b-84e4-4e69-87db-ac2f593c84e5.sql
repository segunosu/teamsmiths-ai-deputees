-- Extend the custom project workflow with quotes and approvals
CREATE TABLE public.custom_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customization_request_id UUID REFERENCES public.customization_requests(id),
  user_id UUID REFERENCES auth.users(id),
  quote_number TEXT UNIQUE NOT NULL DEFAULT 'CQ-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(NEXTVAL('quote_sequence')::TEXT, 4, '0'),
  
  -- Quote details
  project_title TEXT NOT NULL,
  scope_description TEXT NOT NULL,
  deliverables JSONB NOT NULL DEFAULT '[]', -- Array of deliverable objects
  milestones JSONB NOT NULL DEFAULT '[]', -- Array of milestone objects with amounts
  
  -- Pricing
  total_amount INTEGER NOT NULL, -- Total price in cents
  currency TEXT DEFAULT 'gbp',
  payment_structure TEXT DEFAULT 'milestone', -- 'milestone', 'upfront', '50-50'
  
  -- Timeline
  estimated_duration TEXT,
  estimated_start_date DATE,
  
  -- Status and approval
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'modified', 'expired')),
  client_notes TEXT, -- Client feedback on quote
  internal_notes TEXT, -- Internal team notes
  
  -- Approval tracking
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequence for quote numbers
CREATE SEQUENCE quote_sequence START 1000;

-- Create table for quote revisions/modifications
CREATE TABLE public.quote_revisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES public.custom_quotes(id),
  revision_number INTEGER NOT NULL,
  changes_requested TEXT NOT NULL,
  revised_amount INTEGER,
  revised_scope TEXT,
  revised_timeline TEXT,
  requested_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for custom project milestones (separate from standard products)
CREATE TABLE public.custom_project_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id),
  quote_id UUID REFERENCES public.custom_quotes(id),
  
  milestone_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL, -- Amount in cents
  
  due_date DATE,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'pending_approval', 'approved', 'paid')),
  
  -- Deliverables for this milestone
  deliverables JSONB DEFAULT '[]',
  
  -- Payment tracking
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_project_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_quotes
CREATE POLICY "Users can view their own quotes" 
ON public.custom_quotes 
FOR SELECT 
USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage all quotes" 
ON public.custom_quotes 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Users can approve their own quotes" 
ON public.custom_quotes 
FOR UPDATE 
USING (user_id = auth.uid() AND status IN ('sent', 'modified'));

-- RLS Policies for quote_revisions
CREATE POLICY "Users can view revisions for their quotes" 
ON public.quote_revisions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.custom_quotes cq 
  WHERE cq.id = quote_revisions.quote_id 
  AND (cq.user_id = auth.uid() OR is_admin(auth.uid()))
));

CREATE POLICY "Users can request revisions for their quotes" 
ON public.quote_revisions 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.custom_quotes cq 
  WHERE cq.id = quote_revisions.quote_id 
  AND cq.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all revisions" 
ON public.quote_revisions 
FOR ALL 
USING (is_admin(auth.uid()));

-- RLS Policies for custom_project_milestones
CREATE POLICY "View custom milestones (participants or admin)" 
ON public.custom_project_milestones 
FOR SELECT 
USING (is_admin(auth.uid()) OR is_project_participant(project_id, auth.uid()));

CREATE POLICY "Admins can manage custom milestones" 
ON public.custom_project_milestones 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create triggers for timestamps
CREATE TRIGGER update_custom_quotes_updated_at
BEFORE UPDATE ON public.custom_quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_project_milestones_updated_at
BEFORE UPDATE ON public.custom_project_milestones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();