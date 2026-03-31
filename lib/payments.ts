import type { Payment } from "@/lib/mock-data"
import { mapRowToUser, type WorkerApplicationRow } from "@/lib/db/worker-applications"

export const PAYMENT_MONTH_KEYS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const

export type PaymentMonthKey = (typeof PAYMENT_MONTH_KEYS)[number]

export type WorkerMonthlyPaymentRow = {
  id: string
  worker_application_id: string
  year: number
  month: number
  status: "unpaid" | "paid" | "pending"
  paid_at: string | null
  note: string | null
  created_at: string
  updated_at: string
}

function emptyMonths(): Payment["months"] {
  return {
    january: "unpaid",
    february: "unpaid",
    march: "unpaid",
    april: "unpaid",
    may: "unpaid",
    june: "unpaid",
    july: "unpaid",
    august: "unpaid",
    september: "unpaid",
    october: "unpaid",
    november: "unpaid",
    december: "unpaid",
  }
}

export function monthKeyToNumber(key: PaymentMonthKey): number {
  return PAYMENT_MONTH_KEYS.indexOf(key) + 1
}

export function numberToMonthKey(month: number): PaymentMonthKey {
  const i = month - 1
  if (i < 0 || i > 11) return "january"
  return PAYMENT_MONTH_KEYS[i]
}

export function buildPaymentForWorker(
  worker: WorkerApplicationRow,
  year: number,
  monthlyRows: WorkerMonthlyPaymentRow[]
): Payment {
  const u = mapRowToUser(worker)
  const months = emptyMonths()
  const forWorkerYear = monthlyRows.filter(
    (r) => r.worker_application_id === worker.id && r.year === year
  )
  for (const row of forWorkerYear) {
    const key = numberToMonthKey(row.month)
    months[key] = row.status
  }
  return {
    id: `payment-${worker.id}-${year}`,
    userId: worker.id,
    userName: `${u.firstName} ${u.lastName}`.trim(),
    jobType: u.jobType,
    phone: u.whatsapp,
    year,
    months,
    areaServed: u.areaServed,
  }
}

/** Stats derived only from payment rows (selected year). */
export function computePaymentStats(payments: Payment[]) {
  let totalPaid = 0
  let totalUnpaid = 0
  let totalPending = 0
  payments.forEach((payment) => {
    PAYMENT_MONTH_KEYS.forEach((month) => {
      const s = payment.months[month]
      if (s === "paid") totalPaid++
      else if (s === "unpaid") totalUnpaid++
      else totalPending++
    })
  })
  const currentMonthIndex = new Date().getMonth()
  const currentMonthKey = PAYMENT_MONTH_KEYS[currentMonthIndex]
  const paymentsThisMonth = payments.filter((p) => p.months[currentMonthKey] === "paid").length
  const overdueUsers = payments.filter((p) => {
    const through = PAYMENT_MONTH_KEYS.slice(0, currentMonthIndex + 1)
    return through.some((m) => p.months[m] === "unpaid")
  }).length
  return {
    totalPaid,
    totalUnpaid,
    totalPending,
    paymentsThisMonth,
    overdueUsers,
  }
}
