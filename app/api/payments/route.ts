import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/admin"
import type { WorkerApplicationRow } from "@/lib/db/worker-applications"
import { buildPaymentForWorker, type WorkerMonthlyPaymentRow } from "@/lib/payments"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()), 10)
    if (Number.isNaN(year) || year < 2020 || year > 2100) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    const { data: apps, error: appsError } = await supabase
      .from("worker_applications")
      .select("*")
      .order("created_at", { ascending: false })

    if (appsError) {
      console.error("[payments GET] worker_applications", appsError)
      return NextResponse.json({ error: appsError.message }, { status: 500 })
    }

    const { data: monthly, error: monthlyError } = await supabase
      .from("worker_monthly_payments")
      .select("*")
      .eq("year", year)

    if (monthlyError) {
      console.error("[payments GET] worker_monthly_payments", monthlyError)
      return NextResponse.json({ error: monthlyError.message }, { status: 500 })
    }

    const rows = (monthly ?? []) as WorkerMonthlyPaymentRow[]
    const workers = (apps ?? []) as WorkerApplicationRow[]

    const payments = workers.map((w) => buildPaymentForWorker(w, year, rows))

    return NextResponse.json({ payments, year })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    console.error("[payments GET]", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
