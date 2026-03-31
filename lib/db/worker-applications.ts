import type { User, WorkerProfileStatus } from "@/lib/mock-data"

/** Matches `public.worker_applications` (see database/*.sql). */
export type WorkerApplicationRow = {
  id: string
  user_id: string | null
  first_name: string
  last_name: string
  worker_kind: "individual" | "contractor"
  phone: string
  email: string | null
  job_types: string[]
  other_job_type: string | null
  years_experience: number
  district: string
  areas_served: string | null
  services_offered: string[]
  subscription_plan: "monthly_100" | "yearly_1000"
  bio: string
  terms_accepted_at: string
  profile_status: WorkerProfileStatus
  created_at: string
  updated_at: string
}

export function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function primaryJobLabel(row: WorkerApplicationRow): string {
  const types = row.job_types ?? []
  if (types.includes("other") && row.other_job_type?.trim()) {
    return row.other_job_type.trim()
  }
  if (types.length) return slugToLabel(types[0])
  return "—"
}

function areaDisplay(row: WorkerApplicationRow): string {
  const district = slugToLabel(row.district)
  if (row.areas_served?.trim()) {
    return `${district} · ${row.areas_served.trim()}`
  }
  return district
}

function servicesDisplay(row: WorkerApplicationRow): string {
  const list = row.services_offered ?? []
  if (list.length === 0) return "—"
  return list.join(", ")
}

export function mapRowToUser(row: WorkerApplicationRow): User {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    whatsapp: row.phone,
    email: row.email?.trim() ?? "",
    jobType: primaryJobLabel(row),
    jobTypes: row.job_types ?? [],
    workerKind: row.worker_kind,
    otherJobType: row.other_job_type,
    userId: row.user_id,
    yearsOfExperience: row.years_experience,
    areaServed: areaDisplay(row),
    districtSlug: row.district,
    serviceOffered: servicesDisplay(row),
    servicesOffered: row.services_offered ?? [],
    subscriptionPlan: row.subscription_plan,
    bio: row.bio,
    termsAcceptedAt: row.terms_accepted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.profile_status,
  }
}

export function formatSubscriptionLabel(plan?: string): string {
  if (plan === "monthly_100") return "Monthly (Rs 100)"
  if (plan === "yearly_1000") return "Yearly (Rs 1,000)"
  return plan ?? "—"
}

export function formatWorkerKind(kind?: string): string {
  if (kind === "individual") return "Individual"
  if (kind === "contractor") return "Contractor"
  return kind ?? "—"
}

export type RegistrationChartPoint = { month: string; users: number }

/** Next status when the admin toggles approval (approve pending/rejected, or flip active/inactive). */
export function nextProfileStatusAfterToggle(
  current: WorkerProfileStatus
): WorkerProfileStatus {
  if (current === "active") return "inactive"
  if (current === "inactive") return "active"
  if (current === "pending") return "active"
  if (current === "rejected") return "active"
  return "active"
}

/** Buckets `created_at` into calendar months for the given year (labels Jan–Dec). */
export function buildRegistrationChartData(
  rows: Pick<WorkerApplicationRow, "created_at">[],
  year: number
): RegistrationChartPoint[] {
  const monthCounts = Array(12).fill(0) as number[]
  for (const row of rows) {
    const d = new Date(row.created_at)
    if (d.getFullYear() !== year) continue
    monthCounts[d.getMonth()] += 1
  }
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return labels.map((month, i) => ({ month, users: monthCounts[i] }))
}
