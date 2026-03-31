import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/admin"
import { mapRowToUser, type WorkerApplicationRow } from "@/lib/db/worker-applications"

export async function GET() {
  try {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from("worker_applications")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[worker-applications]", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = (data ?? []) as WorkerApplicationRow[]
    const users = rows.map(mapRowToUser)
    return NextResponse.json({ users, rawCount: rows.length })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    console.error("[worker-applications]", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
