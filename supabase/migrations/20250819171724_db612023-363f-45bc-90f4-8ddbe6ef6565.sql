-- Harden RLS for administrative data: admin_actions
-- Goal: prevent unauthorized reads; allow only admins to insert/select; keep no UPDATE/DELETE to preserve integrity

-- Enforce and force RLS on admin_actions
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions FORCE ROW LEVEL SECURITY;

-- Replace SELECT policy with a strict admin-only policy
DROP POLICY IF EXISTS "Super admin can view all admin actions" ON public.admin_actions;
CREATE POLICY "Admins can view admin actions"
ON public.admin_actions
FOR SELECT
USING (public.is_admin_secure());

-- Restrict INSERTs to the acting admin only, and only if the user is admin
DROP POLICY IF EXISTS "Admins can insert their own actions" ON public.admin_actions;
CREATE POLICY "Admins can insert their own actions"
ON public.admin_actions
FOR INSERT
WITH CHECK (auth.uid() = admin_user_id AND public.is_admin_secure());

-- Do not allow UPDATE/DELETE (no policies) to prevent tampering