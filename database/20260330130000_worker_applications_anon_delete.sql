-- Allow anon DELETE from back-office API (same anon key as public app).
-- See security note in 20260330120000_worker_applications_anon_backoffice.sql

GRANT DELETE ON public.worker_applications TO anon;

CREATE POLICY worker_applications_delete_anon_backoffice
  ON public.worker_applications
  FOR DELETE
  TO anon
  USING (true);
