"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import type { DashboardStats } from "@/lib/types"
import type { ApiError } from "@/lib/api-client"
import { Users, Calendar, DollarSign, BookOpen, TrendingUp, Clock, AlertTriangle } from "lucide-react"

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const dashboardResponse = await apiClient.getDashboardOverview()
        
        if (dashboardResponse.success) {
          setStats(dashboardResponse.data.stats)
          setRecentBookings(dashboardResponse.data.recentBookings || [])
          setUpcomingClasses(dashboardResponse.data.upcomingClasses || [])
        } else {
          throw new Error(dashboardResponse.message || 'Failed to fetch dashboard data')
        }
      } catch (err) {
        const errorMessage = (err as ApiError).message || 'Failed to load dashboard data'
        setError(errorMessage)
        console.error('Failed to fetch dashboard data:', err)
        
        // Fallback mock data
        setStats({
          totalUsers: 1247,
          totalBookings: 3892,
          totalRevenue: 45670,
          activeClasses: 24,
          todayBookings: 47,
          monthlyGrowth: 12.5,
        })
        
        setRecentBookings([
          {
            id: "1",
            user: "Sarah Johnson",
            class: "Yoga Flow",
            time: "09:00 AM",
            date: "Today",
            status: "confirmed",
          },
          {
            id: "2",
            user: "Mike Chen",
            class: "Pilates Core",
            time: "06:30 PM",
            date: "Today",
            status: "confirmed",
          }
        ])

        setUpcomingClasses([
          {
            id: "1",
            name: "Morning Yoga",
            instructor: "Sarah Johnson",
            time: "09:00 AM",
            capacity: "8/12",
            room: "Studio A",
          },
          {
            id: "2",
            name: "Pilates Core",
            instructor: "Mike Chen",
            time: "06:30 PM",
            capacity: "6/8",
            room: "Studio B",
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-muted-foreground">Unable to load dashboard data</p>
        </div>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load dashboard statistics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome to your Hi Studio admin dashboard</p>
        {error && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              {error}. Showing fallback data for demo.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />+{stats.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.todayBookings} bookings today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total lifetime revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClasses}</div>
            <p className="text-xs text-muted-foreground">Currently scheduled</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest class bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{booking.user}</p>
                    <p className="text-xs text-muted-foreground">{booking.class} • {booking.time}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                      {booking.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{booking.date}</p>
                  </div>
                </div>
              ))}
              {recentBookings.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent bookings
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
            <CardDescription>Next scheduled sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingClasses.map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{classItem.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {classItem.instructor} • {classItem.room}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">{classItem.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {classItem.capacity} enrolled
                    </p>
                  </div>
                </div>
              ))}
              {upcomingClasses.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming classes
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}