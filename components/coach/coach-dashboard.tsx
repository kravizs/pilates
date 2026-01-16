"use client"

import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock, MessageSquare } from "lucide-react"

export function CoachDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()

  if (!user || user.role !== "coach") {
    return null
  }

  const todayClasses = [
    { id: 1, name: "Morning Pilates", time: "09:00", participants: 8, capacity: 12 },
    { id: 2, name: "Vinyasa Yoga", time: "18:30", participants: 12, capacity: 15 },
  ]

  const weekStats = {
    totalClasses: 12,
    totalParticipants: 89,
    averageRating: 4.8,
    revenue: 1250,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t.coach?.welcome || "Welcome"}, {user.name}
          </h1>
          <p className="text-muted-foreground">
            {t.coach?.subtitle || "Manage your classes and connect with your students"}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.coach?.thisWeek || "This Week"}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekStats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">{t.coach?.classes || "Classes"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.coach?.participants || "Participants"}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekStats.totalParticipants}</div>
            <p className="text-xs text-muted-foreground">{t.coach?.totalStudents || "Total students"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.coach?.rating || "Rating"}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekStats.averageRating}</div>
            <p className="text-xs text-muted-foreground">{t.coach?.average || "Average rating"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.coach?.revenue || "Revenue"}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{weekStats.revenue}</div>
            <p className="text-xs text-muted-foreground">{t.coach?.thisMonth || "This month"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Classes */}
      <Card>
        <CardHeader>
          <CardTitle>{t.coach?.todayClasses || "Today's Classes"}</CardTitle>
          <CardDescription>{t.coach?.todayDesc || "Manage your classes for today"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayClasses.map((cls) => (
              <div key={cls.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-semibold">{cls.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {cls.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {cls.participants}/{cls.capacity}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={cls.participants >= cls.capacity * 0.8 ? "default" : "secondary"}>
                    {Math.round((cls.participants / cls.capacity) * 100)}% full
                  </Badge>
                  <Button size="sm" variant="outline">
                    {t.coach?.viewClass || "View Class"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
