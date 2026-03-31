-- ZotServis worker registration — maps to app/register form fields
-- Run in Supabase SQL Editor or: supabase db push / supabase migration up
-- Note: Supabase hosts a single Postgres database; no separate CREATE DATABASE here.

-- ---------------------------------------------------------------------------
-- Types (optional — keeps CHECK constraints readable)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'worker_kind') THEN
    CREATE TYPE public.worker_kind AS ENUM ('individual', 'contractor');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
    CREATE TYPE public.subscription_plan AS ENUM ('monthly_100', 'yearly_1000');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'worker_profile_status') THEN
    CREATE TYPE public.worker_profile_status AS ENUM ('pending', 'active', 'inactive', 'rejected');
  END IF;
END$$;

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.worker_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Optional link after the worker signs up / you attach auth.users
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,

  first_name text NOT NULL,
  last_name text NOT NULL,
  worker_kind public.worker_kind NOT NULL,

  phone text NOT NULL,
  email text,

  -- Slugs from SERVICE_TYPES (e.g. electrician, plumber, other)
  job_types text[] NOT NULL CHECK (cardinality(job_types) >= 1),
  other_job_type text,

  years_experience smallint NOT NULL CHECK (years_experience >= 0),

  -- MAURITIUS_DISTRICTS value (e.g. port-louis, plaines-wilhems)
  district text NOT NULL,

  areas_served text,

  -- Free-text services from “Services offered” pills
  services_offered text[] NOT NULL DEFAULT '{}'::text[],

  subscription_plan public.subscription_plan NOT NULL,

  bio text NOT NULL,

  -- Legal — set at insert time (same moment as form submit)
  terms_accepted_at timestamptz NOT NULL DEFAULT now(),

  profile_status public.worker_profile_status NOT NULL DEFAULT 'pending',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.worker_applications IS 'Worker registration submissions (register page)';
COMMENT ON COLUMN public.worker_applications.job_types IS 'Multi-select job type slugs; other_job_type when other included';
COMMENT ON COLUMN public.worker_applications.profile_status IS 'pending=new; active=listed; inactive=suspended; rejected=declined';

CREATE INDEX IF NOT EXISTS idx_worker_applications_user_id ON public.worker_applications (user_id);
CREATE INDEX IF NOT EXISTS idx_worker_applications_phone ON public.worker_applications (phone);
CREATE INDEX IF NOT EXISTS idx_worker_applications_email ON public.worker_applications (email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_worker_applications_district ON public.worker_applications (district);
CREATE INDEX IF NOT EXISTS idx_worker_applications_profile_status_created ON public.worker_applications (profile_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_worker_applications_job_types ON public.worker_applications USING gin (job_types);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_worker_applications_updated_at ON public.worker_applications;
CREATE TRIGGER tr_worker_applications_updated_at
  BEFORE UPDATE ON public.worker_applications
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.worker_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_applications FORCE ROW LEVEL SECURITY;

-- Anonymous + logged-in users can submit applications (user_id null or own id only)
CREATE POLICY worker_applications_insert_public
  ON public.worker_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    user_id IS NULL
    OR user_id = (SELECT auth.uid())
  );

-- Logged-in users can read their own linked row(s)
CREATE POLICY worker_applications_select_own
  ON public.worker_applications
  FOR SELECT
  TO authenticated
  USING (user_id IS NOT NULL AND user_id = (SELECT auth.uid()));

-- Logged-in users can update only their own row (e.g. draft profile before approval)
CREATE POLICY worker_applications_update_own
  ON public.worker_applications
  FOR UPDATE
  TO authenticated
  USING (user_id IS NOT NULL AND user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- No DELETE for clients — use Dashboard / service role for admin deletes

-- ---------------------------------------------------------------------------
-- Grants (Supabase: anon/authenticated roles)
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.worker_applications TO authenticated;
GRANT INSERT ON public.worker_applications TO anon;

-- service_role bypasses RLS — use for admin scripts & Edge Functions with service key
