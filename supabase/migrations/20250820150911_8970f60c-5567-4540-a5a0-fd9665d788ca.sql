-- Create storage buckets for project files
INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', false);

-- Storage policies for project files
CREATE POLICY "Users can view project files they have access to" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project-files' AND (
      -- Admin access
      EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true) OR
      -- Project participants can access files
      EXISTS (
        SELECT 1 FROM public.project_deliverables pd
        JOIN public.deliverable_files df ON df.deliverable_id = pd.id
        WHERE df.storage_path = name
        AND is_project_participant(pd.project_id, auth.uid())
      )
    )
  );

CREATE POLICY "Users can upload project files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-files' AND (
      -- Admin can upload anywhere
      EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true) OR
      -- Project participants can upload to their projects
      EXISTS (
        SELECT 1 FROM public.project_deliverables pd
        WHERE pd.id::text = (string_to_array(name, '/'))[1]
        AND is_project_participant(pd.project_id, auth.uid())
      )
    )
  );

CREATE POLICY "Users can update their project files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'project-files' AND (
      -- Admin access
      EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true) OR
      -- File uploader can update
      owner = auth.uid() OR
      -- Project participants can update files in their projects
      EXISTS (
        SELECT 1 FROM public.project_deliverables pd
        JOIN public.deliverable_files df ON df.deliverable_id = pd.id
        WHERE df.storage_path = name
        AND is_project_participant(pd.project_id, auth.uid())
      )
    )
  );

CREATE POLICY "Users can delete their project files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project-files' AND (
      -- Admin access
      EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true) OR
      -- File uploader can delete
      owner = auth.uid()
    )
  );