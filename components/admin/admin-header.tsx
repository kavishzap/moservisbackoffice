"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"

interface AdminHeaderProps {
  title: string
}

export function AdminHeader({ title }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
      <SidebarTrigger className="lg:hidden" />
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  )
}
