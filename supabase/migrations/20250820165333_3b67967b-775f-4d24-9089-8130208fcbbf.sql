-- Harden RLS to fix recursion and overexposure across key tables

-- 1) organization_members: avoid recursive function calls in policies
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members policy" ON public.organization_members;
DROP POLICY IF EXISTS "Org members can view by permission" ON public.organization_members;
DROP POLICY IF EXISTS "Org admins manage members" ON public.organization_members;

-- Users can view their own membership rows; admins can view all
CREATE POLICY "Users view own org memberships"
ON public.organization_members
FOR SELECT
USING (auth.uid() = user_id OR public.is_admin_secure());

-- Only admins manage membership rows (avoids recursion entirely)
CREATE POLICY "Admins manage organization_members"
ON public.organization_members
FOR ALL
USING (public.is_admin_secure())
WITH CHECK (public.is_admin_secure());

REVOKE ALL ON TABLE public.organization_members FROM anon;
REVOKE ALL ON TABLE public.organization_members FROM authenticated;

-- 2) project_submissions: safe owner-or-admin policies
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Project submissions public view" ON public.project_submissions;
DROP POLICY IF EXISTS "Project owners manage submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Admins manage project submissions" ON public.project_submissions;

-- Public can view public submissions; owners and admins can view all of theirs
CREATE POLICY "Public view public project_submissions"
ON public.project_submissions
FOR SELECT
USING ((is_public IS TRUE) OR (auth.uid() = user_id) OR public.is_admin_secure());

-- Users create their own submissions
CREATE POLICY "Users create own project_submissions"
ON public.project_submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Owners or admins can update
CREATE POLICY "Owners or admins update project_submissions"
ON public.project_submissions
FOR UPDATE
USING ((auth.uid() = user_id) OR public.is_admin_secure())
WITH CHECK ((auth.uid() = user_id) OR public.is_admin_secure());

-- Owners or admins can delete
CREATE POLICY "Owners or admins delete project_submissions"
ON public.project_submissions
FOR DELETE
USING ((auth.uid() = user_id) OR public.is_admin_secure());

REVOKE ALL ON TABLE public.project_submissions FROM anon;
REVOKE ALL ON TABLE public.project_submissions FROM authenticated;

-- 3) project_collaborators: safe owner-or-admin policies
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Collaborators can view by relation" ON public.project_collaborators;
DROP POLICY IF EXISTS "Project owners manage collaborators" ON public.project_collaborators;
DROP POLICY IF EXISTS "Admins manage collaborators" ON public.project_collaborators;

-- Users see rows where they are collaborator; admins see all
CREATE POLICY "Users view own collaborations"
ON public.project_collaborators
FOR SELECT
USING ((auth.uid() = user_id) OR public.is_admin_secure());

-- Only admins manage collaborator rows to avoid recursion/complex joins
CREATE POLICY "Admins manage project_collaborators"
ON public.project_collaborators
FOR ALL
USING (public.is_admin_secure())
WITH CHECK (public.is_admin_secure());

REVOKE ALL ON TABLE public.project_collaborators FROM anon;
REVOKE ALL ON TABLE public.project_collaborators FROM authenticated;