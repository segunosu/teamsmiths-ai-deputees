-- Add storage trigger for setting file owners automatically
CREATE OR REPLACE FUNCTION public.handle_storage_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set owner if owner column exists and is not already set
  IF TG_OP = 'INSERT' AND NEW.owner IS NULL THEN
    NEW.owner := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on storage.objects (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_storage_upload') THEN
    CREATE TRIGGER on_storage_upload
      BEFORE INSERT ON storage.objects
      FOR EACH ROW EXECUTE FUNCTION public.handle_storage_upload();
  END IF;
END $$;

-- Update storage policies to enforce naming convention and participant access
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Project participants can view files" ON storage.objects;
DROP POLICY IF EXISTS "Project participants can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Project participants can update files" ON storage.objects;
DROP POLICY IF EXISTS "Project participants can delete files" ON storage.objects;

-- Upload policy with naming convention: deliverableId/version/filename
CREATE POLICY "Project participants can upload with naming convention" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'project-files' AND
  (
    -- Allow if user is admin
    is_admin(auth.uid()) OR
    -- Allow if user is project participant and follows naming convention
    (
      auth.uid() IS NOT NULL AND
      -- Extract deliverable ID from path (format: deliverableId/version/filename)
      EXISTS (
        SELECT 1 FROM project_deliverables pd
        WHERE pd.id::text = split_part(name, '/', 1)
        AND is_project_participant(pd.project_id, auth.uid())
      )
    )
  )
);

-- View policy for project participants
CREATE POLICY "Project participants can view files" ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'project-files' AND
  (
    is_admin(auth.uid()) OR
    (
      auth.uid() IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM project_deliverables pd
        WHERE pd.id::text = split_part(name, '/', 1)
        AND is_project_participant(pd.project_id, auth.uid())
      )
    )
  )
);

-- Update policy for project participants  
CREATE POLICY "Project participants can update files" ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'project-files' AND
  (
    is_admin(auth.uid()) OR
    (
      auth.uid() IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM project_deliverables pd
        WHERE pd.id::text = split_part(name, '/', 1)
        AND is_project_participant(pd.project_id, auth.uid())
      )
    )
  )
);

-- Delete policy for project participants or file owners
CREATE POLICY "Project participants can delete files" ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'project-files' AND
  (
    is_admin(auth.uid()) OR
    owner = auth.uid() OR
    (
      auth.uid() IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM project_deliverables pd
        WHERE pd.id::text = split_part(name, '/', 1)
        AND is_project_participant(pd.project_id, auth.uid())
      )
    )
  )
);