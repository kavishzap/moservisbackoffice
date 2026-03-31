"use client"

import Link from "next/link"
import { AlertTriangle, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Payment } from "@/lib/mock-data"
import { PAYMENT_MONTH_KEYS } from "@/lib/payments"

interface UnpaidUsersAlertProps {
  payments: Payment[]
  year: number
}

export function UnpaidUsersAlert({ payments, year }: UnpaidUsersAlertProps) {
  const currentMonthIndex = new Date().getMonth()
  const relevantMonths = PAYMENT_MONTH_KEYS.slice(0, currentMonthIndex + 1)

  const unpaidUsers = payments
    .filter((payment) => {
      if (payment.year !== year) return false
      return relevantMonths.some((month) => payment.months[month] === "unpaid")
    })
    .slice(0, 5)
    .map((payment) => ({
      ...payment,
      areaServed: payment.areaServed ?? "",
    }))

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-2 space-y-0 sm:flex-row sm:items-start sm:gap-3">
        <AlertTriangle className="size-5 shrink-0 text-amber-500" />
        <div className="min-w-0">
          <CardTitle className="text-base sm:text-lg">Unpaid users alerts</CardTitle>
          <CardDescription className="text-pretty">
            Workers with unpaid months up to the current month ({year})
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 sm:px-6">
        {unpaidUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No overdue months in this year.</p>
        ) : (
          <div className="space-y-3">
            {unpaidUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-medium">{user.userName}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{user.jobType}</span>
                    {user.areaServed ? (
                      <>
                        <span>•</span>
                        <span>{user.areaServed}</span>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
                    Unpaid
                  </Badge>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/payments">
                      <Eye className="mr-1 size-3" />
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
