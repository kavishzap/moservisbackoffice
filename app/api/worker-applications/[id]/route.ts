import { NextResponse } from "next/server"
import { z } from "zod"
import { getSupabaseServer } from "@/lib/supabase/admin"
import { mapRowToUser, type WorkerApplicationRow } from "@/lib/db/worker-applications"

const patchSchema = z.object({
  profile_status: z.enum(["pending", "active", "inactive", "rejected"]),
})

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const json = await request.json()
    const parsed = patchSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 })
    }

    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from("worker_applications")
      .update({ profile_status: parsed.data.profile_status })
      .eq("id", id)
      .select("*")
      .maybeSingle()

    if (error) {
      console.error("[worker-applications PATCH]", error)
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.details,
          hint:
            error.code === "42501" || error.message?.toLowerCase().includes("permission")
              ? "Run database/20260330120000_worker_applications_anon_backoffice.sql and 20260330140000_worker_applications_anon_update_fix.sql in Supabase (GRANT UPDATE + UPDATE policy for anon)."
              : error.hint,
        },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "Update ran but the row could not be returned. Usually anon may only SELECT active profiles: after setting status to inactive/pending/rejected, RLS hides the row from the API response.",
          hint: "In Supabase SQL Editor, run database/anon_backoffice_full.sql (adds anon SELECT USING (true) plus UPDATE/DELETE).",
        },
        { status: 409 }
      )
    }

    const user = mapRowToUser(data as WorkerApplicationRow)
    return NextResponse.json({ user })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    console.error("[worker-applications PATCH]", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = getSupabaseServer()
    const { error } = await supabase.from("worker_applications").delete().eq("id", id)

    if (error) {
      console.error("[worker-applications DELETE]", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    console.error("[worker-applications DELETE]", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
