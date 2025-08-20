-- Create freelancer profiles with matching signals
CREATE TABLE public.freelancer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skills TEXT[] DEFAULT '{}',
  industries TEXT[] DEFAULT '{}',
  tools TEXT[] DEFAULT '{}',
  price_band_min INTEGER, -- in pence
  price_band_max INTEGER, -- in pence
  certifications TEXT[] DEFAULT '{}',
  locales TEXT[] DEFAULT '{}',
  availability_weekly_hours INTEGER DEFAULT 40,
  pto_ranges JSONB DEFAULT '[]'::jsonb,
  connected_calendar BOOLEAN DEFAULT false,
  outcome_history JSONB DEFAULT '{
    "csat_score": null,
    "on_time_rate": null,
    "revision_rate": null,
    "pass_at_qa_rate": null,
    "dispute_rate": null
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create matching snapshots to store ranked candidates
CREATE TABLE public.matching_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES customization_requests(id) ON DELETE CASCADE,
  candidates JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{user_id, score, breakdown, ai_rationale}]
  matching_weights JSONB NOT NULL DEFAULT '{
    "skills": 0.25,
    "domain": 0.15,
    "outcomes": 0.20,
    "availability": 0.15,
    "locale": 0.05,
    "price": 0.10,
    "vetting": 0.07,
    "history": 0.03
  }'::jsonb,
  shortlist_size INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create invite status tracking
CREATE TABLE public.invite_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES customization_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('sent', 'accepted', 'declined', 'expired')) DEFAULT 'sent',
  expires_at TIMESTAMPTZ NOT NULL,
  invited_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE(request_id, user_id)
);

-- Create standardized quotes table
CREATE TABLE public.standardized_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES customization_requests(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
  timeline_weeks INTEGER,
  total_price INTEGER NOT NULL, -- in pence
  currency TEXT DEFAULT 'gbp',
  assumptions TEXT,
  qa_guarantees TEXT,
  portfolio_highlights TEXT[],
  validity_until TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(request_id, freelancer_id)
);

-- Enable RLS on new tables
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matching_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standardized_quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for freelancer_profiles
CREATE POLICY "Freelancers can manage own profile" ON public.freelancer_profiles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.freelancer_profiles
  FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for matching_snapshots
CREATE POLICY "Admins can manage matching snapshots" ON public.matching_snapshots
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for invite_status
CREATE POLICY "View invites (admin or invitee)" ON public.invite_status
  FOR SELECT USING (is_admin(auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Update invites (admin or invitee)" ON public.invite_status
  FOR UPDATE USING (is_admin(auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Insert invites (admin only)" ON public.invite_status
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- RLS Policies for standardized_quotes
CREATE POLICY "View quotes (admin, client, or freelancer)" ON public.standardized_quotes
  FOR SELECT USING (
    is_admin(auth.uid()) OR 
    freelancer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM customization_requests cr WHERE cr.id = request_id AND cr.user_id = auth.uid())
  );

CREATE POLICY "Freelancers can manage own quotes" ON public.standardized_quotes
  FOR ALL USING (freelancer_id = auth.uid());

CREATE POLICY "Admins can manage all quotes" ON public.standardized_quotes
  FOR ALL USING (is_admin(auth.uid()));

-- Add matching settings to admin_settings if not exists
INSERT INTO public.admin_settings (setting_key, setting_value)
VALUES (
  'matching_config',
  '{
    "matching_weights": {
      "skills": 0.25,
      "domain": 0.15,
      "outcomes": 0.20,
      "availability": 0.15,
      "locale": 0.05,
      "price": 0.10,
      "vetting": 0.07,
      "history": 0.03
    },
    "shortlist_size_default": 3,
    "invite_response_sla_hours": 24,
    "max_quotes_per_request": 3,
    "min_quotes_before_presenting": 2,
    "sensitive_single_provider_only": false,
    "conflict_window_days": 60
  }'::jsonb
)
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes for performance
CREATE INDEX idx_freelancer_profiles_user_id ON public.freelancer_profiles(user_id);
CREATE INDEX idx_freelancer_profiles_skills ON public.freelancer_profiles USING GIN(skills);
CREATE INDEX idx_matching_snapshots_request_id ON public.matching_snapshots(request_id);
CREATE INDEX idx_invite_status_request_user ON public.invite_status(request_id, user_id);
CREATE INDEX idx_invite_status_expires_at ON public.invite_status(expires_at);
CREATE INDEX idx_standardized_quotes_request_id ON public.standardized_quotes(request_id);

-- Create trigger to update updated_at
CREATE TRIGGER update_freelancer_profiles_updated_at
  BEFORE UPDATE ON public.freelancer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_standardized_quotes_updated_at  
  BEFORE UPDATE ON public.standardized_quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();