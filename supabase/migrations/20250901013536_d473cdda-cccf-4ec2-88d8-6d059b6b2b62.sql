-- Expert Selection System Database Setup

-- Add selected_expert_id to briefs table
ALTER TABLE public.briefs ADD COLUMN IF NOT EXISTS selected_expert_id UUID;

-- Create brief_participants table for tracking client-expert relationships
CREATE TABLE IF NOT EXISTS public.brief_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES public.briefs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'expert')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on brief_participants
ALTER TABLE public.brief_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for brief_participants
CREATE POLICY "View brief participants (participants or admin)" ON public.brief_participants
  FOR SELECT USING (
    user_id = auth.uid() OR is_admin(auth.uid())
  );

CREATE POLICY "Insert brief participants (admin only)" ON public.brief_participants
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Update brief participants (admin only)" ON public.brief_participants
  FOR UPDATE USING (is_admin(auth.uid()));

-- Create brief_chat_messages table for client-expert communication
CREATE TABLE IF NOT EXISTS public.brief_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES public.briefs(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'expert', 'system')),
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  metadata JSONB DEFAULT '{}',
  flagged_for_review BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on brief_chat_messages
ALTER TABLE public.brief_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for brief_chat_messages
CREATE POLICY "View brief chat messages (participants or admin)" ON public.brief_chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.brief_participants bp 
      WHERE bp.brief_id = brief_chat_messages.brief_id 
      AND bp.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

CREATE POLICY "Insert brief chat messages (participants)" ON public.brief_chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.brief_participants bp 
      WHERE bp.brief_id = brief_chat_messages.brief_id 
      AND bp.user_id = auth.uid()
    ) AND sender_id = auth.uid()
  );

-- Function to select expert for brief and create project
CREATE OR REPLACE FUNCTION public.select_expert_for_brief(
  p_brief_id UUID,
  p_expert_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  brief_record RECORD;
  expert_profile RECORD;
  client_user_id UUID;
  project_id UUID;
  result JSONB;
BEGIN
  -- Get brief details
  SELECT * FROM public.briefs WHERE id = p_brief_id INTO brief_record;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Brief not found');
  END IF;

  -- Get expert profile
  SELECT fp.*, p.full_name, p.email 
  FROM public.freelancer_profiles fp
  JOIN public.profiles p ON p.user_id = fp.user_id
  WHERE fp.user_id = p_expert_user_id INTO expert_profile;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Expert profile not found');
  END IF;

  -- Get client user_id
  client_user_id := brief_record.user_id;
  IF client_user_id IS NULL THEN
    -- For guest briefs, create user first or handle differently
    RETURN jsonb_build_object('success', false, 'error', 'Client user not found');
  END IF;

  -- Update brief with selected expert
  UPDATE public.briefs 
  SET selected_expert_id = p_expert_user_id,
      status = 'expert_selected',
      updated_at = now()
  WHERE id = p_brief_id;

  -- Mark all other invites as not_selected
  UPDATE public.expert_invites 
  SET status = 'not_selected',
      updated_at = now()
  WHERE brief_id = p_brief_id 
  AND expert_user_id != p_expert_user_id
  AND status != 'declined';

  -- Mark selected expert invite as selected
  UPDATE public.expert_invites 
  SET status = 'selected',
      updated_at = now()
  WHERE brief_id = p_brief_id 
  AND expert_user_id = p_expert_user_id;

  -- Add participants to brief_participants
  INSERT INTO public.brief_participants (brief_id, user_id, role)
  VALUES 
    (p_brief_id, client_user_id, 'client'),
    (p_brief_id, p_expert_user_id, 'expert')
  ON CONFLICT DO NOTHING;

  -- Create welcome message in brief chat
  INSERT INTO public.brief_chat_messages (brief_id, sender_id, sender_role, message, message_type)
  VALUES (
    p_brief_id,
    client_user_id,
    'system',
    'Expert has been selected! You can now chat directly and schedule an intro call.',
    'system'
  );

  -- Create notifications for both parties
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES 
    (p_expert_user_id, 'expert_selected', 'You''ve been selected! 🎉', 'You''ve been chosen for ' || COALESCE(brief_record.structured_brief->>'project_title', 'this project') || '.', p_brief_id),
    (client_user_id, 'expert_selected_client', 'Expert selected', 'You''ve selected an expert for your project. Chat is now available.', p_brief_id);

  -- Mark other non-selected experts
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  SELECT 
    expert_user_id,
    'expert_not_selected',
    'Project outcome',
    'Another expert was selected for ' || COALESCE(brief_record.structured_brief->>'project_title', 'this project') || '. Thanks for applying!',
    p_brief_id
  FROM public.expert_invites 
  WHERE brief_id = p_brief_id 
  AND expert_user_id != p_expert_user_id
  AND status = 'not_selected';

  RETURN jsonb_build_object(
    'success', true, 
    'brief_id', p_brief_id,
    'expert_id', p_expert_user_id,
    'expert_name', expert_profile.full_name
  );
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_brief_participants_brief_id ON public.brief_participants(brief_id);
CREATE INDEX IF NOT EXISTS idx_brief_participants_user_id ON public.brief_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_brief_chat_messages_brief_id ON public.brief_chat_messages(brief_id);
CREATE INDEX IF NOT EXISTS idx_brief_chat_messages_created_at ON public.brief_chat_messages(created_at);

-- Enable realtime for new tables
ALTER publication supabase_realtime ADD TABLE public.brief_participants;
ALTER publication supabase_realtime ADD TABLE public.brief_chat_messages;

-- Set replica identity for realtime updates
ALTER TABLE public.brief_participants REPLICA IDENTITY FULL;
ALTER TABLE public.brief_chat_messages REPLICA IDENTITY FULL;