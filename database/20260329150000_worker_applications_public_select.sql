-- Allow public (anon) read of listed workers; users can still read their own row in any status.
DROP POLICY IF EXISTS worker_applications_select_own ON public.worker_applications;

CREATE POLICY worker_applications_select_public_or_own
  ON public.worker_applications
  FOR SELECT
  TO anon, authenticated
  USING (
    profile_status = 'active'
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

GRANT SELECT ON public.worker_applications TO anon;
