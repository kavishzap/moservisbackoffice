import { NextResponse } from "next/server"
import { z } from "zod"
import { getSupabaseServer } from "@/lib/supabase/admin"
import type { WorkerApplicationRow } from "@/lib/db/worker-applications"
import { buildPaymentForWorker, type WorkerMonthlyPaymentRow } from "@/lib/payments"

const bodySchema = z.object({
  worker_application_id: z.string().uuid(),
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
  status: z.enum(["unpaid", "paid", "pending"]),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 })
    }

    const { worker_application_id, year, month, status } = parsed.data
    const paid_at = status === "paid" ? new Date().toISOString() : null

    const supabase = getSupabaseServer()

    const { data: upserted, error: upsertError } = await supabase
      .from("worker_monthly_payments")
      .upsert(
        {
          worker_application_id,
          year,
          month,
          status,
          paid_at,
        },
        { onConflict: "worker_application_id,year,month" }
      )
      .select("*")
      .maybeSingle()

    if (upsertError) {
      console.error("[payments/month POST]", upsertError)
      return NextResponse.json(
        {
          error: upsertError.message,
          hint: "Ensure database/20260330200000_worker_monthly_payments.sql was applied.",
        },
        { status: 500 }
      )
    }

    if (!upserted) {
      return NextResponse.json(
        { error: "Upsert returned no row; check RLS SELECT on worker_monthly_payments." },
        { status: 409 }
      )
    }

    const { data: worker, error: workerErr } = await supabase
      .from("worker_applications")
      .select("*")
      .eq("id", worker_application_id)
      .maybeSingle()

    if (workerErr || !worker) {
      return NextResponse.json({ error: workerErr?.message || "Worker not found" }, { status: 404 })
    }

    const { data: yearRows } = await supabase
      .from("worker_monthly_payments")
      .select("*")
      .eq("worker_application_id", worker_application_id)
      .eq("year", year)

    const payment = buildPaymentForWorker(
      worker as WorkerApplicationRow,
      year,
      (yearRows ?? []) as WorkerMonthlyPaymentRow[]
    )

    return NextResponse.json({ payment, row: upserted })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    console.error("[payments/month POST]", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
