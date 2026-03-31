"use client"

import { Eye, Check } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Payment } from "@/lib/mock-data"

const monthKeys = [
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

interface PaymentsTableProps {
  payments: Payment[]
  onViewHistory: (payment: Payment) => void
  /** worker_application_id (same as Payment.userId) */
  onMarkAsPaid: (workerApplicationId: string, month: typeof monthKeys[number]) => void
}

function PaymentBadge({
  status,
  onClick,
  showMarkAsPaid = false,
}: {
  status: "paid" | "unpaid" | "pending"
  onClick?: () => void
  showMarkAsPaid?: boolean
}) {
  const styles = {
    paid: "bg-green-100 text-green-700 hover:bg-green-100",
    unpaid: "bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer",
    pending: "bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer",
  }

  if (status !== "paid" && showMarkAsPaid && onClick) {
    return (
      <Badge
        variant="secondary"
        className={`${styles[status]} inline-flex min-h-9 min-w-0 touch-manipulation items-center justify-center gap-1 px-1.5 py-1 text-[10px] leading-tight lg:min-h-0 lg:text-xs`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onClick()}
      >
        <Check className="size-3 shrink-0" />
        <span className="hidden min-[400px]:inline">Mark Paid</span>
        <span className="min-[400px]:hidden">Pay</span>
      </Badge>
    )
  }

  return (
    <Badge
      variant="secondary"
      className={`${styles[status]} inline-flex min-h-9 min-w-0 touch-manipulation items-center justify-center px-1.5 py-1 text-[10px] lg:min-h-0 lg:text-xs`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export function PaymentsTable({ payments, onViewHistory, onMarkAsPaid }: PaymentsTableProps) {
  const currentMonth = new Date().getMonth()

  return (
    <>
      {/* Desktop / tablet: wide table with horizontal scroll on narrow widths */}
      <div className="hidden lg:block">
        <div className="-mx-4 rounded-lg border border-border sm:mx-0">
          <Table className="min-w-[72rem]">
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-10 min-w-[8rem] bg-background shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]">
                User
              </TableHead>
              <TableHead>Job Type</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Year</TableHead>
              <TableHead className="text-center">Paid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => {
              const paidMonths = monthKeys.filter(
                (month) => payment.months[month] === "paid"
              ).length
              const hasUnpaid = monthKeys
                .slice(0, currentMonth + 1)
                .some((month) => payment.months[month] === "unpaid")
              const overallStatus = hasUnpaid ? "overdue" : paidMonths === 12 ? "complete" : "current"

              return (
                <TableRow key={payment.id}>
                  <TableCell className="sticky left-0 z-10 min-w-[8rem] bg-background font-medium shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]">
                    {payment.userName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{payment.jobType}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{payment.phone}</TableCell>
                  <TableCell>{payment.year}</TableCell>
                  <TableCell className="text-center font-medium">
                    {paidMonths}/12
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        overallStatus === "overdue"
                          ? "bg-red-100 text-red-700 hover:bg-red-100"
                          : overallStatus === "complete"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                      }
                    >
                      {overallStatus === "overdue"
                        ? "Overdue"
                        : overallStatus === "complete"
                        ? "Complete"
                        : "Current"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewHistory(payment)}
                    >
                      <Eye className="mr-1 size-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Phone / small tablet: stacked cards with tappable months */}
      <div className="grid gap-4 lg:hidden">
        {payments.map((payment) => {
          const paidMonths = monthKeys.filter(
            (month) => payment.months[month] === "paid"
          ).length
          const hasUnpaid = monthKeys
            .slice(0, currentMonth + 1)
            .some((month) => payment.months[month] === "unpaid")
          const overallStatus = hasUnpaid ? "overdue" : paidMonths === 12 ? "complete" : "current"

          return (
            <div
              key={payment.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold leading-snug">{payment.userName}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{payment.jobType}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    overallStatus === "overdue"
                      ? "shrink-0 bg-red-100 text-red-700 hover:bg-red-100"
                      : overallStatus === "complete"
                      ? "shrink-0 bg-green-100 text-green-700 hover:bg-green-100"
                      : "shrink-0 bg-blue-100 text-blue-700 hover:bg-blue-100"
                  }
                >
                  {overallStatus === "overdue"
                    ? "Overdue"
                    : overallStatus === "complete"
                    ? "Complete"
                    : "Current"}
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm sm:grid-cols-3">
                <div className="min-w-0">
                  <span className="text-muted-foreground">Phone</span>
                  <p className="truncate font-medium">{payment.phone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Year</span>
                  <p className="font-medium">{payment.year}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-muted-foreground">Paid months</span>
                  <p className="font-medium">{paidMonths}/12</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Monthly details are available in the sidebar view.</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full min-h-11 touch-manipulation"
                onClick={() => onViewHistory(payment)}
              >
                <Eye className="mr-1 size-4 shrink-0" />
                View payment history
              </Button>
            </div>
          )
        })}
      </div>
    </>
  )
}
