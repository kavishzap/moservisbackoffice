-- Back-office Next.js API uses only anon + project URL (same as your public app).
-- Without service_role, RLS must explicitly allow anon to list and update applications.
--
-- SECURITY: The anon key is public in browser bundles. These policies mean anyone who
-- has the key can read/update all rows via the Supabase REST API. Use only if that
-- tradeoff is acceptable, or keep back-office behind VPN / separate deployment and
-- prefer service_role + tighter RLS for production.

GRANT UPDATE ON public.worker_applications TO anon;

-- Extra SELECT for anon: OR’d with existing policies, so anon can read every row.
CREATE POLICY worker_applications_select_anon_backoffice
  ON public.worker_applications
  FOR SELECT
  TO anon
  USING (true);

-- Allow anon to update rows (e.g. profile_status) from server routes using anon key.
CREATE POLICY worker_applications_update_anon_backoffice
  ON public.worker_applications
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
