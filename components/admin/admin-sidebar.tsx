"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Calendar, BookOpen, FileText, Settings } from "lucide-react"

type AdminView = "overview" | "users" | "bookings" | "classes" | "content" | "mindbody"

interface AdminSidebarProps {
  currentView: AdminView
  onViewChange: (view: AdminView) => void
}

export function AdminSidebar({ currentView, onViewChange }: AdminSidebarProps) {
  const menuItems = [
    {
      id: "overview" as AdminView,
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "users" as AdminView,
      label: "Users",
      icon: Users,
    },
    {
      id: "bookings" as AdminView,
      label: "Bookings",
      icon: Calendar,
    },
    {
      id: "classes" as AdminView,
      label: "Classes",
      icon: BookOpen,
    },
    {
      id: "content" as AdminView,
      label: "Content",
      icon: FileText,
    },
    {
      id: "mindbody" as AdminView,
      label: "MindBody",
      icon: Settings,
    },
  ]

  return (
    <aside className="w-64 border-r bg-muted/30 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              className={cn("w-full justify-start", currentView === item.id && "bg-primary text-primary-foreground")}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          )
        })}
      </nav>
    </aside>
  )
}
