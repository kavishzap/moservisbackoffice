"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { AdminLayout } from "@/components/admin/admin-layout"
import { UsersTable } from "@/components/admin/users-table"
import { UsersFilters } from "@/components/admin/users-filters"
import { UserDetailsModal } from "@/components/admin/user-details-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, WorkerProfileStatus } from "@/lib/mock-data"
import {
  nextProfileStatusAfterToggle,
  slugToLabel,
} from "@/lib/db/worker-applications"

const ITEMS_PER_PAGE = 10

const STATUS_FILTER_MAP: Record<string, WorkerProfileStatus | undefined> = {
  Active: "active",
  Inactive: "inactive",
  Pending: "pending",
  Rejected: "rejected",
}

function matchesJobType(user: User, jobTypeFilter: string): boolean {
  if (jobTypeFilter === "All") return true
  if (jobTypeFilter === "Other") return user.jobTypes.includes("other")
  return (
    user.jobType === jobTypeFilter ||
    user.jobTypes.some((s) => slugToLabel(s) === jobTypeFilter)
  )
}

function matchesArea(user: User, areaFilter: string): boolean {
  if (areaFilter === "All") return true
  if (user.districtSlug) {
    return slugToLabel(user.districtSlug) === areaFilter
  }
  return user.areaServed === areaFilter
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const [search, setSearch] = useState("")
  const [jobTypeFilter, setJobTypeFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [areaFilter, setAreaFilter] = useState("All")

  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await fetch("/api/worker-applications")
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to load applications")
        if (!cancelled) setUsers(data.users ?? [])
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load users")
        if (!cancelled) setUsers([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesSearch =
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.whatsapp.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      if (!matchesJobType(user, jobTypeFilter)) return false

      if (statusFilter !== "All") {
        const want = STATUS_FILTER_MAP[statusFilter]
        if (want && user.status !== want) return false
      }

      if (!matchesArea(user, areaFilter)) return false

      return true
    })
  }, [users, search, jobTypeFilter, statusFilter, areaFilter])

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredUsers, currentPage])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE))
    if (currentPage > maxPage) setCurrentPage(maxPage)
  }, [filteredUsers.length, currentPage])

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setDetailsOpen(true)
  }

  const handleSetStatus = useCallback(async (userId: string, status: WorkerProfileStatus) => {
    try {
      const res = await fetch(`/api/worker-applications/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_status: status }),
      })
      const data = await res.json()
      if (!res.ok) {
        const extra = [data.details, data.hint].filter(Boolean).join(" ")
        throw new Error(
          [data.error, extra].filter(Boolean).join(" — ") || "Update failed"
        )
      }
      const updated = data.user as User
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)))
      setSelectedUser((prev) => (prev?.id === userId ? updated : prev))
      toast.success("Status updated")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed")
    }
  }, [])

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/worker-applications/${userId}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Delete failed")
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      setSelectedUser(null)
      setDetailsOpen(false)
      toast.success("Application deleted")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed")
    }
  }, [])

  const handleToggleStatus = useCallback(
    async (userId: string) => {
      const u = users.find((x) => x.id === userId)
      if (!u) return
      await handleSetStatus(userId, nextProfileStatusAfterToggle(u.status))
    },
    [users, handleSetStatus]
  )

  const handleClearFilters = () => {
    setSearch("")
    setJobTypeFilter("All")
    setStatusFilter("All")
    setAreaFilter("All")
    setCurrentPage(1)
  }

  return (
    <AdminLayout title="Users">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            {loading
              ? "Loading worker applications…"
              : `View and manage service workers. ${filteredUsers.length} users found.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <UsersFilters
            search={search}
            onSearchChange={(value) => {
              setSearch(value)
              setCurrentPage(1)
            }}
            jobTypeFilter={jobTypeFilter}
            onJobTypeFilterChange={(value) => {
              setJobTypeFilter(value)
              setCurrentPage(1)
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(value) => {
              setStatusFilter(value)
              setCurrentPage(1)
            }}
            areaFilter={areaFilter}
            onAreaFilterChange={(value) => {
              setAreaFilter(value)
              setCurrentPage(1)
            }}
            onClearFilters={handleClearFilters}
          />

          <UsersTable
            users={paginatedUsers}
            onViewDetails={handleViewDetails}
            onToggleStatus={handleToggleStatus}
            pagination={{
              currentPage,
              totalPages: totalPages || 1,
              totalItems: filteredUsers.length,
              pageSize: ITEMS_PER_PAGE,
              onPageChange: setCurrentPage,
            }}
          />
        </CardContent>
      </Card>

      <UserDetailsModal
        user={selectedUser}
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open)
          if (!open) setSelectedUser(null)
        }}
        onSetStatus={handleSetStatus}
        onDelete={handleDeleteUser}
      />
    </AdminLayout>
  )
}
