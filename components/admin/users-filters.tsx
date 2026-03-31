"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UsersFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  jobTypeFilter: string
  onJobTypeFilterChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  areaFilter: string
  onAreaFilterChange: (value: string) => void
  onClearFilters: () => void
}

const jobTypes = [
  "All",
  "Electrician",
  "Plumber",
  "Cleaner",
  "Gardener",
  "Painter",
  "Mason",
  "Handyman",
  "Other",
]
const statuses = ["All", "Active", "Inactive", "Pending", "Rejected"]
const areas = [
  "All",
  "Port Louis",
  "Black River",
  "Flacq",
  "Grand Port",
  "Moka",
  "Pamplemousses",
  "Plaines Wilhems",
  "Rivière Du Rempart",
  "Rivière Noire",
  "Savanne",
  "Curepipe",
  "Quatre Bornes",
  "Vacoas",
  "Rose Hill",
  "Mahebourg",
  "Goodlands",
  "Triolet",
  "Beau Bassin",
]

export function UsersFilters({
  search,
  onSearchChange,
  jobTypeFilter,
  onJobTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  areaFilter,
  onAreaFilterChange,
  onClearFilters,
}: UsersFiltersProps) {
  const hasFilters = search || jobTypeFilter !== "All" || statusFilter !== "All" || areaFilter !== "All"

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="relative flex flex-1 flex-col gap-2">
          <Label htmlFor="users-search" className="text-muted-foreground">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="users-search"
              placeholder="Name, email, or phone"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-1 size-4" />
            Clear filters
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="users-filter-job-type" className="text-muted-foreground">
            Job type
          </Label>
          <Select value={jobTypeFilter} onValueChange={onJobTypeFilterChange}>
            <SelectTrigger id="users-filter-job-type" className="w-full min-w-0">
              <SelectValue placeholder="All job types" />
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="users-filter-status" className="text-muted-foreground">
            Profile status
          </Label>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger id="users-filter-status" className="w-full min-w-0">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="users-filter-area" className="text-muted-foreground">
            District / area
          </Label>
          <Select value={areaFilter} onValueChange={onAreaFilterChange}>
            <SelectTrigger id="users-filter-area" className="w-full min-w-0">
              <SelectValue placeholder="All areas" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
