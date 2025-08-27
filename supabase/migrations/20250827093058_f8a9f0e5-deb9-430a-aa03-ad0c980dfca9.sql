-- Mitigate Security Definer View issues: use security_invoker and restrict direct access

-- 1) Ensure all admin views run as invoker so underlying RLS applies to the querying role
ALTER VIEW public.admin_v_agencies SET (security_invoker = true);
ALTER VIEW public.admin_v_briefs SET (security_invoker = true);
ALTER VIEW public.admin_v_client_orgs SET (security_invoker = true);
ALTER VIEW public.admin_v_custom_milestones SET (security_invoker = true);
ALTER VIEW public.admin_v_deliverables SET (security_invoker = true);
ALTER VIEW public.admin_v_freelancers SET (security_invoker = true);
ALTER VIEW public.admin_v_meetings SET (security_invoker = true);
ALTER VIEW public.admin_v_milestones SET (security_invoker = true);
ALTER VIEW public.admin_v_project_deliverables SET (security_invoker = true);
ALTER VIEW public.admin_v_projects SET (security_invoker = true);
ALTER VIEW public.admin_v_quotes SET (security_invoker = true);
ALTER VIEW public.admin_v_requests SET (security_invoker = true);

-- 2) Revoke direct access from client roles; admin access should go through SECURITY DEFINER functions that enforce is_admin()
REVOKE ALL ON TABLE public.admin_v_agencies FROM anon, authenticated;
REVOKE ALL ON TABLE public.admin_v_briefs FROM anon, authenticated;
REVOKE ALL ON TABLE public.admin_v_client_orgs FROM anon, authenticated;
REVOKE ALL ON TABLE public.admin_v_custom_milestones FROM anon, authenticated;
REVOKE ALL ON TABLE public.admin_v_deliverables FROM anon, authenticated;
REVOKE ALL ON TABLE public.admin_v_freelancers FROM anon, authenticated;
REVOKE ALL ON TABLE public.admin_v_meetings FROM anon, authenticated;
REVOKE ALL ON TABLE public.admin_v_milestones FROM anon, authenticated;
REVOKE ALL ON TABLE public.admin_v_project_deliverables FROM anon, authenticated;
REVOKE ALL ON TABLE public.admin_v_projects FROM anon, authenticated;
REVOKE ALL ON TABLE public.admin_v_quotes FROM anon, authenticated;
REVOKE ALL ON TABLE public.admin_v_requests FROM anon, authenticated;