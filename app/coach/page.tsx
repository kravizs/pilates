"use client"

import { useAuth } from "@/contexts/auth-context"
import { CoachDashboard } from "@/components/coach/coach-dashboard"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CoachPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please log in to access the coach dashboard</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (user.role !== "coach" && !user.is_admin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access the coach dashboard</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <CoachDashboard />
      </div>
    </div>
  )
}
