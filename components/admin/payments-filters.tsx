"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PaymentsFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  yearFilter: string
  onYearFilterChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  jobTypeFilter: string
  onJobTypeFilterChange: (value: string) => void
  onClearFilters: () => void
}

const currentY = new Date().getFullYear()
const years = Array.from({ length: 7 }, (_, i) => String(currentY - 3 + i))
const statuses = ["All", "Current", "Overdue", "Complete"]
const jobTypes = ["All", "Electrician", "Plumber", "Cleaner", "Gardener", "Painter", "Mason", "Handyman"]

export function PaymentsFilters({
  search,
  onSearchChange,
  yearFilter,
  onYearFilterChange,
  statusFilter,
  onStatusFilterChange,
  jobTypeFilter,
  onJobTypeFilterChange,
  onClearFilters,
}: PaymentsFiltersProps) {
  const hasFilters = search || statusFilter !== "All" || jobTypeFilter !== "All"

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by user name or phone..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-1 size-4" />
            Clear filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:flex lg:flex-wrap">
        {/* Year Filter */}
        <Select value={yearFilter} onValueChange={onYearFilterChange}>
          <SelectTrigger className="w-full min-w-0 lg:w-28">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full min-w-0 lg:w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Job Type Filter */}
        <Select value={jobTypeFilter} onValueChange={onJobTypeFilterChange}>
          <SelectTrigger className="w-full min-w-0 min-[480px]:col-span-2 lg:col-span-1 lg:w-40">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            {jobTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
