"use client"

import { useState } from "react"
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { User } from "@/lib/mock-data"
import { nextProfileStatusAfterToggle } from "@/lib/db/worker-applications"

function statusBadgeClass(status: User["status"]) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700 hover:bg-green-100"
    case "inactive":
      return "bg-gray-100 text-gray-600 hover:bg-gray-100"
    case "pending":
      return "bg-amber-100 text-amber-800 hover:bg-amber-100"
    case "rejected":
      return "bg-red-100 text-red-800 hover:bg-red-100"
    default:
      return "bg-gray-100 text-gray-600 hover:bg-gray-100"
  }
}

function statusLabel(status: User["status"]) {
  switch (status) {
    case "active":
      return "Active"
    case "inactive":
      return "Inactive"
    case "pending":
      return "Pending"
    case "rejected":
      return "Rejected"
    default:
      return status
  }
}

export type UsersTablePagination = {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

interface UsersTableProps {
  users: User[]
  onViewDetails: (user: User) => void
  onToggleStatus: (userId: string) => void
  pagination: UsersTablePagination
}

function toggleConfirmationCopy(user: User): { title: string; description: string } {
  const name = `${user.firstName} ${user.lastName}`.trim()
  const next = nextProfileStatusAfterToggle(user.status)
  const nextLabel = statusLabel(next)
  const extra =
    user.status === "active"
      ? " They will no longer be listed as active workers."
      : ""
  return {
    title: "Change profile status?",
    description: `This will set ${name}'s status to ${nextLabel}.${extra}`,
  }
}

export function UsersTable({ users, onViewDetails, onToggleStatus, pagination }: UsersTableProps) {
  const [toggleTarget, setToggleTarget] = useState<User | null>(null)
  const { currentPage, totalPages, totalItems, pageSize, onPageChange } = pagination
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, totalItems)

  const confirmToggle = () => {
    if (toggleTarget) {
      onToggleStatus(toggleTarget.id)
    }
    setToggleTarget(null)
  }

  const toggleCopy = toggleTarget ? toggleConfirmationCopy(toggleTarget) : null

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full name</TableHead>
              <TableHead>WhatsApp / Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Job Type</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {`${user.firstName} ${user.lastName}`.trim()}
                </TableCell>
                <TableCell className="text-sm">{user.whatsapp}</TableCell>
                <TableCell className="text-sm">{user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.jobType}</Badge>
                </TableCell>
                <TableCell>{user.yearsOfExperience} yrs</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusBadgeClass(user.status)}>
                    {statusLabel(user.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => setToggleTarget(user)}
                      title={
                        user.status === "active"
                          ? "Set inactive"
                          : user.status === "inactive"
                            ? "Set active"
                            : `Set to ${statusLabel(nextProfileStatusAfterToggle(user.status))}`
                      }
                    >
                      {user.status === "active" ? (
                        <ToggleRight className="size-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="size-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => onViewDetails(user)}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 p-4 lg:hidden">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">
                  {`${user.firstName} ${user.lastName}`.trim()}
                </h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Badge variant="secondary" className={statusBadgeClass(user.status)}>
                {statusLabel(user.status)}
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Job Type:</span>
                <p className="font-medium">{user.jobType}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Experience:</span>
                <p className="font-medium">{user.yearsOfExperience} years</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Phone:</span>
                <p className="font-medium">{user.whatsapp}</p>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setToggleTarget(user)}
              >
                {user.status === "active" ? (
                  <>
                    <ToggleRight className="mr-1 size-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <ToggleLeft className="mr-1 size-4" />
                    {user.status === "pending" || user.status === "rejected"
                      ? "Approve"
                      : "Activate"}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onViewDetails(user)}
              >
                <Eye className="mr-1 size-4" />
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {totalItems > 0 && (
        <div className="flex flex-col gap-3 border-t border-border bg-muted/30 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            Showing{" "}
            <span className="font-medium text-foreground">{rangeStart}</span>–
            <span className="font-medium text-foreground">{rangeEnd}</span>
            {" of "}
            <span className="font-medium text-foreground">{totalItems}</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 shrink-0"
              title="First page"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(1)}
            >
              <ChevronFirst className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 shrink-0"
              title="Previous page"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[7rem] px-2 text-center text-sm tabular-nums text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 shrink-0"
              title="Next page"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 shrink-0"
              title="Last page"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(totalPages)}
            >
              <ChevronLast className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={toggleTarget !== null} onOpenChange={(open) => !open && setToggleTarget(null)}>
        <AlertDialogContent>
          {toggleCopy && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{toggleCopy.title}</AlertDialogTitle>
                <AlertDialogDescription>{toggleCopy.description}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                <Button type="button" onClick={confirmToggle}>
                  Confirm
                </Button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
