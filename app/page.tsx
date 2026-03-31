"use client"

import { useEffect, useState, useMemo } from "react"
import { Users, UserCheck, UserX, Clock } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StatsCard } from "@/components/admin/stats-card"
import { UserGrowthChart } from "@/components/admin/user-growth-chart"
import { User } from "@/lib/mock-data"
import { buildRegistrationChartData } from "@/lib/db/worker-applications"

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const year = new Date().getFullYear()

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await fetch("/api/worker-applications")
        const data = await res.json()
        if (!cancelled && res.ok) setUsers(data.users ?? [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(() => {
    const totalUsers = users.length
    const activeUsers = users.filter((u) => u.status === "active").length
    const inactiveUsers = users.filter((u) => u.status === "inactive").length
    const pendingUsers = users.filter((u) => u.status === "pending").length
    return { totalUsers, activeUsers, inactiveUsers, pendingUsers }
  }, [users])

  const growthData = useMemo(
    () => buildRegistrationChartData(users.map((u) => ({ created_at: u.createdAt })), year),
    [users, year]
  )

  const fmt = (n: number) => (loading ? "—" : String(n))

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Users" value={fmt(stats.totalUsers)} icon={Users} />
          <StatsCard title="Active Users" value={fmt(stats.activeUsers)} icon={UserCheck} />
          <StatsCard title="Inactive Users" value={fmt(stats.inactiveUsers)} icon={UserX} />
          <StatsCard title="Pending review" value={fmt(stats.pendingUsers)} icon={Clock} />
        </div>

        <UserGrowthChart data={growthData} yearLabel={year} />
      </div>
    </AdminLayout>
  )
}
