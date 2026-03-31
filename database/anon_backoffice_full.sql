-- =============================================================================
-- ZotServis back office + anon key — run this ONCE in Supabase SQL Editor
-- =============================================================================
-- Symptom: GET /api/worker-applications works, but PATCH returns
-- "No row was updated..." or empty body — usually because anon may only SELECT
-- rows where profile_status = 'active'. After you set someone to inactive,
-- PostgREST cannot RETURN that row unless anon can SELECT all rows.
--
-- This script grants privileges and adds broad anon policies (OR’d with your
-- existing ones). Safe to re-run (DROP POLICY IF EXISTS before CREATE).
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.worker_applications TO anon;

DROP POLICY IF EXISTS worker_applications_select_anon_backoffice ON public.worker_applications;

CREATE POLICY worker_applications_select_anon_backoffice
  ON public.worker_applications
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS worker_applications_update_anon_backoffice ON public.worker_applications;

CREATE POLICY worker_applications_update_anon_backoffice
  ON public.worker_applications
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS worker_applications_delete_anon_backoffice ON public.worker_applications;

CREATE POLICY worker_applications_delete_anon_backoffice
  ON public.worker_applications
  FOR DELETE
  TO anon
  USING (true);
