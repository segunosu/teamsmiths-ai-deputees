-- Helper security-definer functions
CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = _uid AND p.is_admin = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_participant(_project_id uuid, _uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_participants pp
    WHERE pp.project_id = _project_id AND pp.user_id = _uid
  );
$$;

CREATE OR REPLACE FUNCTION public.get_project_id_from_deliverable(_deliverable_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT d.project_id FROM public.deliverables d WHERE d.id = _deliverable_id;
$$;

CREATE OR REPLACE FUNCTION public.get_project_id_from_document(_document_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT doc.project_id FROM public.documents doc WHERE doc.id = _document_id;
$$;

CREATE OR REPLACE FUNCTION public.get_project_id_from_milestone(_milestone_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT m.project_id FROM public.milestones m WHERE m.id = _milestone_id;
$$;

-- RLS policies to cover all tables
-- Orgs: members and admins can view
CREATE POLICY "View orgs (members or admin)" ON public.orgs
FOR SELECT USING (
  public.is_admin(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.org_members om WHERE om.org_id = orgs.id AND om.user_id = auth.uid()
  )
);

-- Org members: view your own org memberships or members of your org; admins can see all
CREATE POLICY "View org_members (self, same org, admin)" ON public.org_members
FOR SELECT USING (
  public.is_admin(auth.uid()) OR user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.org_members x WHERE x.org_id = org_members.org_id AND x.user_id = auth.uid()
  )
);

-- Teamsmiths: owner or admin
CREATE POLICY "View teamsmiths (owner or admin)" ON public.teamsmiths
FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Agencies: members or admin
CREATE POLICY "View agencies (members or admin)" ON public.agencies
FOR SELECT USING (
  public.is_admin(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.agency_members am WHERE am.agency_id = agencies.id AND am.user_id = auth.uid()
  )
);

-- Agency members: anyone in the same agency or admin
CREATE POLICY "View agency_members (same agency or admin)" ON public.agency_members
FOR SELECT USING (
  public.is_admin(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.agency_members x WHERE x.agency_id = agency_members.agency_id AND x.user_id = auth.uid()
  )
);

-- Product snapshots: only admins or participants of a project that references the snapshot
CREATE POLICY "View product_snapshots (related participants or admin)" ON public.product_snapshots
FOR SELECT USING (
  public.is_admin(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.project_participants pp ON pp.project_id = p.id AND pp.user_id = auth.uid()
    WHERE p.product_snapshot_id = product_snapshots.id
  )
);

-- Project participants: row owner, any participant of the project, or admin
CREATE POLICY "View project_participants (participants or admin)" ON public.project_participants
FOR SELECT USING (
  public.is_admin(auth.uid()) OR user_id = auth.uid() OR public.is_project_participant(project_id, auth.uid())
);

-- Milestones
CREATE POLICY "View milestones (participants or admin)" ON public.milestones
FOR SELECT USING (public.is_admin(auth.uid()) OR public.is_project_participant(project_id, auth.uid()));

-- Deliverables
CREATE POLICY "View deliverables (participants or admin)" ON public.deliverables
FOR SELECT USING (public.is_admin(auth.uid()) OR public.is_project_participant(project_id, auth.uid()));

-- Deliverable versions
CREATE POLICY "View deliverable_versions (participants or admin)" ON public.deliverable_versions
FOR SELECT USING (
  public.is_admin(auth.uid()) OR public.is_project_participant(public.get_project_id_from_deliverable(deliverable_id), auth.uid())
);

-- QA reviews
CREATE POLICY "View qa_reviews (participants or admin)" ON public.qa_reviews
FOR SELECT USING (
  public.is_admin(auth.uid()) OR public.is_project_participant(public.get_project_id_from_deliverable(deliverable_id), auth.uid())
);

-- Change orders
CREATE POLICY "View change_orders (participants or admin)" ON public.change_orders
FOR SELECT USING (public.is_admin(auth.uid()) OR public.is_project_participant(project_id, auth.uid()));

-- Messages
CREATE POLICY "View project_messages (participants or admin)" ON public.project_messages
FOR SELECT USING (public.is_admin(auth.uid()) OR public.is_project_participant(project_id, auth.uid()));

-- Files
CREATE POLICY "View project_files (participants or admin)" ON public.project_files
FOR SELECT USING (public.is_admin(auth.uid()) OR public.is_project_participant(project_id, auth.uid()));

-- Transcripts
CREATE POLICY "View transcripts (participants or admin)" ON public.transcripts
FOR SELECT USING (public.is_admin(auth.uid()) OR public.is_project_participant(project_id, auth.uid()));

-- Documents
CREATE POLICY "View documents (participants or admin)" ON public.documents
FOR SELECT USING (public.is_admin(auth.uid()) OR public.is_project_participant(project_id, auth.uid()));

-- Document chunks
CREATE POLICY "View document_chunks (participants or admin)" ON public.document_chunks
FOR SELECT USING (
  public.is_admin(auth.uid()) OR public.is_project_participant(public.get_project_id_from_document(document_id), auth.uid())
);

-- Payment intents
CREATE POLICY "View payment_intents (participants or admin)" ON public.payment_intents
FOR SELECT USING (public.is_admin(auth.uid()) OR public.is_project_participant(project_id, auth.uid()));

-- Agency payout splits (participants of project via milestone)
CREATE POLICY "View agency_payout_splits (participants or admin)" ON public.agency_payout_splits
FOR SELECT USING (
  public.is_admin(auth.uid()) OR public.is_project_participant(public.get_project_id_from_milestone(milestone_id), auth.uid())
);