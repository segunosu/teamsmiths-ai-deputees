-- Add missing RLS policies for project_messages to allow users to send messages

-- Allow project participants to insert messages
CREATE POLICY "Insert project_messages (participants or admin)" 
ON public.project_messages 
FOR INSERT 
WITH CHECK (
  is_admin(auth.uid()) OR is_project_participant(project_id, auth.uid())
);

-- Allow project participants to update their own messages (optional)
CREATE POLICY "Update own project_messages (participants or admin)" 
ON public.project_messages 
FOR UPDATE 
USING (
  (is_admin(auth.uid()) OR is_project_participant(project_id, auth.uid())) 
  AND user_id = auth.uid()
);

-- Allow project participants to delete their own messages (optional)
CREATE POLICY "Delete own project_messages (participants or admin)" 
ON public.project_messages 
FOR DELETE 
USING (
  (is_admin(auth.uid()) OR is_project_participant(project_id, auth.uid())) 
  AND user_id = auth.uid()
);