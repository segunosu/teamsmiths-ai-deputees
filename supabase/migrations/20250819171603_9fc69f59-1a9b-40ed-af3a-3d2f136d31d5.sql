-- Create chat_sessions table for AI agent conversations
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create chat_messages table for individual messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create project_insights table for AI-generated insights
CREATE TABLE public.project_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'implemented')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_insights ENABLE ROW LEVEL SECURITY;

-- Chat sessions policies
CREATE POLICY "View chat_sessions (participants or admin)" ON public.chat_sessions
FOR SELECT USING (
  is_admin(auth.uid()) OR 
  is_project_participant(project_id, auth.uid())
);

CREATE POLICY "Create chat_sessions (authenticated)" ON public.chat_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own chat_sessions" ON public.chat_sessions
FOR UPDATE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "View chat_messages (session participants)" ON public.chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_sessions cs 
    WHERE cs.id = session_id 
    AND (is_admin(auth.uid()) OR is_project_participant(cs.project_id, auth.uid()))
  )
);

CREATE POLICY "Create chat_messages (session participants)" ON public.chat_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_sessions cs 
    WHERE cs.id = session_id 
    AND (is_admin(auth.uid()) OR is_project_participant(cs.project_id, auth.uid()))
  )
);

-- Project insights policies
CREATE POLICY "View project_insights (participants or admin)" ON public.project_insights
FOR SELECT USING (
  is_admin(auth.uid()) OR 
  is_project_participant(project_id, auth.uid())
);

CREATE POLICY "Update project_insights (participants or admin)" ON public.project_insights
FOR UPDATE USING (
  is_admin(auth.uid()) OR 
  is_project_participant(project_id, auth.uid())
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_sessions_updated_at 
BEFORE UPDATE ON public.chat_sessions 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_insights_updated_at 
BEFORE UPDATE ON public.project_insights 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();