"use client"

import { useState, type ReactNode } from "react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, WorkerProfileStatus } from "@/lib/mock-data"
import {
  formatSubscriptionLabel,
  formatWorkerKind,
  slugToLabel,
} from "@/lib/db/worker-applications"

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

function formatDateTime(iso?: string) {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return iso
  }
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[minmax(8rem,30%)_1fr] sm:items-start sm:gap-3">
      <dt className="text-xs font-medium text-muted-foreground sm:pt-0.5">{label}</dt>
      <dd className="text-sm break-words">{value}</dd>
    </div>
  )
}

interface UserDetailsModalProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSetStatus: (userId: string, status: WorkerProfileStatus) => Promise<void>
  onDelete: (userId: string) => Promise<void>
}

export function UserDetailsModal({
  user,
  open,
  onOpenChange,
  onSetStatus,
  onDelete,
}: UserDetailsModalProps) {
  const [busy, setBusy] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!user) return null

  const fullName = `${user.firstName} ${user.lastName}`.trim()
  const types = user.jobTypes ?? []
  const jobTypesDisplay =
    types.length > 0 ? types.map((s) => slugToLabel(s)).join(", ") : "—"

  async function run(action: () => Promise<void>) {
    setBusy(true)
    try {
      await action()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton
          className="flex max-h-[min(90vh,52rem)] w-[calc(100%-1.5rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
        >
          <div className="shrink-0 border-b px-4 py-4 sm:px-6">
            <DialogHeader className="space-y-2 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-xl">{fullName}</DialogTitle>
                <Badge variant="secondary" className={statusBadgeClass(user.status)}>
                  {statusLabel(user.status)}
                </Badge>
              </div>
              <DialogDescription>Worker application — full record</DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <dl className="space-y-4">
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Identity
                </h3>
                <DetailRow label="Worker type" value={formatWorkerKind(user.workerKind)} />
              </section>

              <Separator />

              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Contact
                </h3>
                <DetailRow label="Phone / WhatsApp" value={user.whatsapp || "—"} />
                <DetailRow label="Email" value={user.email || "—"} />
              </section>

              <Separator />

              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Professional
                </h3>
                <DetailRow label="Job types (slugs)" value={jobTypesDisplay} />
                <DetailRow label="Primary label" value={user.jobType} />
                <DetailRow
                  label="Years of experience"
                  value={`${user.yearsOfExperience} years`}
                />
                <DetailRow label="District" value={user.districtSlug ? slugToLabel(user.districtSlug) : "—"} />
                <DetailRow label="Area / coverage" value={user.areaServed || "—"} />
              </section>

              <Separator />

              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Services &amp; plan
                </h3>
                <DetailRow
                  label="Subscription"
                  value={formatSubscriptionLabel(user.subscriptionPlan)}
                />
              </section>

              <Separator />

              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Bio
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{user.bio || "—"}</p>
              </section>

              <Separator />

              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Timestamps
                </h3>
                <DetailRow label="Terms accepted" value={formatDateTime(user.termsAcceptedAt)} />
                <DetailRow label="Created" value={formatDateTime(user.createdAt)} />
                <DetailRow label="Last updated" value={formatDateTime(user.updatedAt)} />
              </section>
            </dl>
          </div>

          <DialogFooter className="shrink-0 flex-col gap-3 border-t bg-muted/30 px-4 py-4 sm:flex-row sm:flex-wrap sm:justify-start sm:px-6">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="default"
                disabled={busy || user.status === "active"}
                className="w-full sm:w-auto"
                onClick={() =>
                  run(async () => {
                    await onSetStatus(user.id, "active")
                  })
                }
              >
                Set as active
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={busy || user.status === "inactive"}
                className="w-full sm:w-auto"
                onClick={() =>
                  run(async () => {
                    await onSetStatus(user.id, "inactive")
                  })
                }
              >
                Set as inactive
              </Button>
            </div>
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              className="w-full sm:ml-auto sm:w-auto"
              onClick={() => setDeleteOpen(true)}
            >
              Delete application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="z-[60]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this application?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <strong>{fullName}</strong> from worker applications. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                try {
                  await onDelete(user.id)
                  setDeleteOpen(false)
                  onOpenChange(false)
                } finally {
                  setBusy(false)
                }
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
