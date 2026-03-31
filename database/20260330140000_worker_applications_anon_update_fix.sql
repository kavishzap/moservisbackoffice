-- If PATCH / updates return 500 (RLS or permission errors), run this in Supabase SQL Editor.
-- Safe to re-run: drops and recreates the anon UPDATE policy and ensures GRANT.

GRANT UPDATE ON public.worker_applications TO anon;

DROP POLICY IF EXISTS worker_applications_update_anon_backoffice ON public.worker_applications;

CREATE POLICY worker_applications_update_anon_backoffice
  ON public.worker_applications
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
