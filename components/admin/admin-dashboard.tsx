"use client"

import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { AdminSidebar } from "./admin-sidebar"
import { DashboardOverview } from "./dashboard-overview"
import { UserManagement } from "./user-management"
import { BookingManagement } from "./booking-management"
import { ClassManagement } from "./class-management"
import { ContentManagement } from "./content-management"
import { MindBodySettings } from "./mindbody-settings"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { LogOut, Shield } from "lucide-react"

type AdminView = "overview" | "users" | "bookings" | "classes" | "content" | "mindbody"

export function AdminDashboard() {
  const { user, isAdmin, logout } = useAuth()
  const { t } = useLanguage()
  const [currentView, setCurrentView] = useState<AdminView>("overview")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading check
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-6 p-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">You need admin privileges to access this dashboard.</p>
            <p className="text-sm text-muted-foreground">
              Demo: Use <code className="bg-muted px-2 py-1 rounded">admin@histudio.com</code> to access admin features.
            </p>
          </div>
          <Button onClick={() => (window.location.href = "/")}>Return to Home</Button>
        </div>
      </div>
    )
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "overview":
        return <DashboardOverview />
      case "users":
        return <UserManagement />
      case "bookings":
        return <BookingManagement />
      case "classes":
        return <ClassManagement />
      case "content":
        return <ContentManagement />
      case "mindbody":
        return <MindBodySettings />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-primary"></div>
            <div>
              <h1 className="text-lg font-semibold">Hi Studio Admin</h1>
              <p className="text-sm text-muted-foreground">Content Management System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome, {user.first_name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar currentView={currentView} onViewChange={setCurrentView} />

        {/* Main Content */}
        <main className="flex-1 p-6">{renderCurrentView()}</main>
      </div>
    </div>
  )
}
