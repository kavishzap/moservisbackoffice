-- Monthly subscription payment tracking (one row per worker × year × calendar month).
-- Run in Supabase SQL Editor after worker_applications exists.
-- Back office uses the same anon key: add GRANT + RLS policies below (or merge into anon_backoffice_full pattern).

CREATE TABLE IF NOT EXISTS public.worker_monthly_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_application_id uuid NOT NULL REFERENCES public.worker_applications (id) ON DELETE CASCADE,
  year smallint NOT NULL CHECK (year >= 2020 AND year <= 2100),
  month smallint NOT NULL CHECK (month >= 1 AND month <= 12),
  status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'pending')),
  paid_at timestamptz,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT worker_monthly_payments_worker_year_month UNIQUE (worker_application_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_worker_monthly_payments_worker_year
  ON public.worker_monthly_payments (worker_application_id, year);

COMMENT ON TABLE public.worker_monthly_payments IS 'Per-worker monthly fee status; supports prepaid future months (status=paid ahead of calendar month).';

DROP TRIGGER IF EXISTS tr_worker_monthly_payments_updated_at ON public.worker_monthly_payments;
CREATE TRIGGER tr_worker_monthly_payments_updated_at
  BEFORE UPDATE ON public.worker_monthly_payments
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE public.worker_monthly_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_monthly_payments FORCE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.worker_monthly_payments TO anon, authenticated;

CREATE POLICY worker_monthly_payments_select_anon
  ON public.worker_monthly_payments FOR SELECT TO anon USING (true);

CREATE POLICY worker_monthly_payments_insert_anon
  ON public.worker_monthly_payments FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY worker_monthly_payments_update_anon
  ON public.worker_monthly_payments FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY worker_monthly_payments_delete_anon
  ON public.worker_monthly_payments FOR DELETE TO anon USING (true);
