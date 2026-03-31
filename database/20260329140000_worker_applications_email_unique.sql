-- One registration per email (case-insensitive). Multiple rows with NULL email are still allowed.
DROP INDEX IF EXISTS idx_worker_applications_email;

CREATE UNIQUE INDEX IF NOT EXISTS worker_applications_email_unique
  ON public.worker_applications (lower(btrim(email)))
  WHERE email IS NOT NULL AND btrim(email) <> '';
