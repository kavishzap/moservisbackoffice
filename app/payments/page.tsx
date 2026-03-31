"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { AlertTriangle, Calendar, ChevronLeft, ChevronRight, DollarSign, Users } from "lucide-react"
import { toast } from "sonner"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StatsCard } from "@/components/admin/stats-card"
import { PaymentsTable } from "@/components/admin/payments-table"
import { PaymentsFilters } from "@/components/admin/payments-filters"
import { PaymentHistoryDrawer } from "@/components/admin/payment-history-drawer"
import { UnpaidUsersAlert } from "@/components/admin/unpaid-users-alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Payment } from "@/lib/mock-data"
import {
  computePaymentStats,
  monthKeyToNumber,
  PAYMENT_MONTH_KEYS,
  type PaymentMonthKey,
} from "@/lib/payments"

const ITEMS_PER_PAGE = 10

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [search, setSearch] = useState("")
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()))
  const [statusFilter, setStatusFilter] = useState("All")
  const [jobTypeFilter, setJobTypeFilter] = useState("All")

  const [currentPage, setCurrentPage] = useState(1)
  const currentMonth = new Date().getMonth()

  const loadPayments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/payments?year=${encodeURIComponent(yearFilter)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load payments")
      setPayments(data.payments ?? [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load payments")
      setPayments([])
    } finally {
      setLoading(false)
    }
  }, [yearFilter])

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  const stats = useMemo(() => computePaymentStats(payments), [payments])

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesSearch =
          payment.userName.toLowerCase().includes(searchLower) ||
          payment.phone.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      if (payment.year !== parseInt(yearFilter, 10)) {
        return false
      }

      if (jobTypeFilter !== "All" && payment.jobType !== jobTypeFilter) {
        return false
      }

      if (statusFilter !== "All") {
        const paidMonths = PAYMENT_MONTH_KEYS.filter((month) => payment.months[month] === "paid").length
        const hasUnpaid = PAYMENT_MONTH_KEYS.slice(0, currentMonth + 1).some(
          (month) => payment.months[month] === "unpaid"
        )

        if (statusFilter === "Overdue" && !hasUnpaid) return false
        if (statusFilter === "Complete" && paidMonths !== 12) return false
        if (statusFilter === "Current" && (hasUnpaid || paidMonths === 12)) return false
      }

      return true
    })
  }, [payments, search, yearFilter, statusFilter, jobTypeFilter, currentMonth])

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE) || 1
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredPayments.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredPayments, currentPage])

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(Math.max(1, totalPages))
  }, [currentPage, totalPages])

  const handleViewHistory = (payment: Payment) => {
    setSelectedPayment(payment)
    setDrawerOpen(true)
  }

  const handleMarkAsPaid = useCallback(
    async (workerApplicationId: string, month: PaymentMonthKey) => {
      try {
        const res = await fetch("/api/payments/month", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            worker_application_id: workerApplicationId,
            year: parseInt(yearFilter, 10),
            month: monthKeyToNumber(month),
            status: "paid",
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          const extra = [data.details, data.hint].filter(Boolean).join(" ")
          throw new Error([data.error, extra].filter(Boolean).join(" — ") || "Update failed")
        }
        const updated = data.payment as Payment
        setPayments((prev) => prev.map((p) => (p.userId === workerApplicationId ? updated : p)))
        setSelectedPayment((prev) => (prev?.userId === workerApplicationId ? updated : prev))
        toast.success("Marked as paid")
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Update failed")
      }
    },
    [yearFilter]
  )

  const handleClearFilters = () => {
    setSearch("")
    setStatusFilter("All")
    setJobTypeFilter("All")
    setCurrentPage(1)
  }

  return (
    <AdminLayout title="Payments">
      <div className="space-y-4 sm:space-y-6">
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <StatsCard title="Total paid (cells)" value={stats.totalPaid} icon={DollarSign} />
          <StatsCard title="Total unpaid (cells)" value={stats.totalUnpaid} icon={AlertTriangle} />
          <StatsCard title="Paid this calendar month" value={stats.paymentsThisMonth} icon={Calendar} />
          <StatsCard title="Users with overdue months" value={stats.overdueUsers} icon={Users} />
        </div>

        <UnpaidUsersAlert payments={payments} year={parseInt(yearFilter, 10)} />

        <Card className="overflow-hidden">
          <CardHeader className="space-y-1 px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
            <CardTitle className="text-lg sm:text-xl">Payment Tracking</CardTitle>
            <CardDescription className="text-pretty leading-relaxed">
              {loading
                ? "Loading payments…"
                : `Monthly fee status per worker for ${yearFilter}. ${filteredPayments.length} workers.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4 sm:space-y-6 sm:px-6 sm:pb-6">
            <PaymentsFilters
              search={search}
              onSearchChange={(value) => {
                setSearch(value)
                setCurrentPage(1)
              }}
              yearFilter={yearFilter}
              onYearFilterChange={(value) => {
                setYearFilter(value)
                setCurrentPage(1)
              }}
              statusFilter={statusFilter}
              onStatusFilterChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
              jobTypeFilter={jobTypeFilter}
              onJobTypeFilterChange={(value) => {
                setJobTypeFilter(value)
                setCurrentPage(1)
              }}
              onClearFilters={handleClearFilters}
            />

            <PaymentsTable
              payments={paginatedPayments}
              onViewHistory={handleViewHistory}
              onMarkAsPaid={handleMarkAsPaid}
            />

            {totalPages > 1 && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-center text-sm text-muted-foreground sm:text-left">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex justify-center gap-2 sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-10 min-w-[7rem] touch-manipulation"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="mr-1 size-4 shrink-0" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-10 min-w-[7rem] touch-manipulation"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="ml-1 size-4 shrink-0" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <PaymentHistoryDrawer
          payment={selectedPayment}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          onMarkAsPaid={handleMarkAsPaid}
        />
      </div>
    </AdminLayout>
  )
}
