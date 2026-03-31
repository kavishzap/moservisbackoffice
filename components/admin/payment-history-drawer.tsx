"use client"

import { CheckCircle, XCircle, Clock, Phone, Briefcase, User } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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

interface PaymentHistoryDrawerProps {
  payment: Payment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onMarkAsPaid: (workerApplicationId: string, month: typeof monthKeys[number]) => void
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function PaymentHistoryDrawer({
  payment,
  open,
  onOpenChange,
  onMarkAsPaid,
}: PaymentHistoryDrawerProps) {
  if (!payment) return null

  const currentMonth = new Date().getMonth()
  const paidMonths = monthKeys.filter((month) => payment.months[month] === "paid").length
  const unpaidMonths = monthKeys
    .slice(0, currentMonth + 1)
    .filter((month) => payment.months[month] === "unpaid").length
  const pendingMonths = monthKeys
    .slice(0, currentMonth + 1)
    .filter((month) => payment.months[month] === "pending").length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-y-auto p-4 sm:max-w-md sm:p-6">
        <SheetHeader className="space-y-1 text-left">
          <SheetTitle className="text-lg sm:text-xl">Payment History</SheetTitle>
          <SheetDescription>
            Payment details for {payment.year}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* User Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <User className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">User Name</p>
                <p className="text-sm font-medium">{payment.userName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Briefcase className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Job Type</p>
                <p className="text-sm font-medium">{payment.jobType}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Phone className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{payment.phone}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="min-w-0 rounded-lg bg-green-50 p-2 text-center sm:p-3">
              <p className="text-xl font-bold tabular-nums text-green-700 sm:text-2xl">{paidMonths}</p>
              <p className="text-[10px] text-green-600 sm:text-xs">Paid</p>
            </div>
            <div className="min-w-0 rounded-lg bg-amber-50 p-2 text-center sm:p-3">
              <p className="text-xl font-bold tabular-nums text-amber-700 sm:text-2xl">{pendingMonths}</p>
              <p className="text-[10px] text-amber-600 sm:text-xs">Pending</p>
            </div>
            <div className="min-w-0 rounded-lg bg-red-50 p-2 text-center sm:p-3">
              <p className="text-xl font-bold tabular-nums text-red-700 sm:text-2xl">{unpaidMonths}</p>
              <p className="text-[10px] text-red-600 sm:text-xs">Unpaid</p>
            </div>
          </div>

          <Separator />

          {/* Monthly Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Monthly Breakdown</h4>
            <div className="space-y-2">
              {monthKeys.map((month, index) => {
                const status = payment.months[month]
                const isFuture = index > currentMonth

                return (
                  <div
                    key={month}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      isFuture ? "border-dashed border-primary/20 bg-muted/20" : ""
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{monthNames[index]}</span>
                      {isFuture && (
                        <span className="text-xs text-muted-foreground">Future month — can prepay</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {status === "paid" && (
                        <>
                          <CheckCircle className="size-4 text-green-600" />
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Paid</Badge>
                        </>
                      )}
                      {status === "unpaid" && (
                        <>
                          <XCircle className="size-4 text-red-600" />
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Unpaid</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() => onMarkAsPaid(payment.userId, month)}
                          >
                            Mark Paid
                          </Button>
                        </>
                      )}
                      {status === "pending" && (
                        <>
                          <Clock className="size-4 text-amber-600" />
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                            Pending
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() => onMarkAsPaid(payment.userId, month)}
                          >
                            Mark Paid
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
