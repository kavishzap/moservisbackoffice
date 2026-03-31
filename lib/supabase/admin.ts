import { createClient, SupabaseClient } from "@supabase/supabase-js"

let serverClient: SupabaseClient | null = null

/**
 * Server-side Supabase client using the same credentials as the public app:
 * `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
 *
 * RLS must allow anon to read/update `worker_applications` for back-office routes
 * — apply `database/20260330120000_worker_applications_anon_backoffice.sql` in Supabase.
 */
export function getSupabaseServer(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!url || !anonKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env"
    )
  }

  if (!serverClient) {
    serverClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return serverClient
}

/** @deprecated Use `getSupabaseServer` */
export const getSupabaseAdmin = getSupabaseServer
