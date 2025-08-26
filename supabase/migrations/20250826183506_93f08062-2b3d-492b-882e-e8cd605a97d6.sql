-- Create expert_invites table for tracking invitations
CREATE TABLE IF NOT EXISTS public.expert_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES public.briefs(id) ON DELETE CASCADE,
  expert_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'viewed', 'accepted', 'declined', 'expired')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  score_at_invite DECIMAL(3,2) DEFAULT 0.65,
  invitation_message TEXT,
  response_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(brief_id, expert_user_id)
);

-- Enable RLS on expert_invites
ALTER TABLE public.expert_invites ENABLE ROW LEVEL SECURITY;

-- Create policies for expert_invites
CREATE POLICY "Admins can manage all invites" ON public.expert_invites
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Experts can view their own invites" ON public.expert_invites
  FOR SELECT USING (expert_user_id = auth.uid());

CREATE POLICY "Experts can update their own invites" ON public.expert_invites
  FOR UPDATE USING (expert_user_id = auth.uid())
  WITH CHECK (expert_user_id = auth.uid());

-- Create index for performance
CREATE INDEX idx_expert_invites_brief_id ON public.expert_invites(brief_id);
CREATE INDEX idx_expert_invites_expert_user_id ON public.expert_invites(expert_user_id);
CREATE INDEX idx_expert_invites_status ON public.expert_invites(status);

-- Create updated_at trigger
CREATE TRIGGER update_expert_invites_updated_at
  BEFORE UPDATE ON public.expert_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();