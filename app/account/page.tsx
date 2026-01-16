"use client"

import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/i18n"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CreditCard, User, Settings, Download } from "lucide-react"
import { useState } from "react"

export default function AccountPage() {
  const { user, logout } = useAuth()
  const { language } = useLanguage()
  const t = translations[language]
  const [isEditing, setIsEditing] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t.account?.loginRequired || "Login Required"}</CardTitle>
            <CardDescription>{t.account?.loginMessage || "Please log in to access your account"}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const upcomingClasses = [
    { name: "Morning Pilates", date: "2024-01-15", time: "09:00", instructor: "Sarah Martinez" },
    { name: "Vinyasa Yoga", date: "2024-01-17", time: "18:30", instructor: "Lucas Dubois" },
    { name: "Barre Fusion", date: "2024-01-19", time: "10:00", instructor: "Emma Thompson" },
  ]

  const classHistory = [
    { name: "Pilates Core", date: "2024-01-10", instructor: "Sarah Martinez", status: "completed" },
    { name: "Hatha Yoga", date: "2024-01-08", instructor: "Lucas Dubois", status: "completed" },
    { name: "Morning Barre", date: "2024-01-05", instructor: "Emma Thompson", status: "cancelled" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t.account?.welcome || "Welcome back"}, {user.name}!
          </h1>
          <p className="text-muted-foreground">
            {t.account?.subtitle || "Manage your classes, profile, and membership"}
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t.account?.overview || "Overview"}
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t.account?.classes || "Classes"}
            </TabsTrigger>
            <TabsTrigger value="membership" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              {t.account?.membership || "Membership"}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {t.account?.settings || "Settings"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t.account?.nextClass || "Next Class"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold">Morning Pilates</p>
                    <p className="text-sm text-muted-foreground">January 15, 2024 at 9:00 AM</p>
                    <p className="text-sm text-muted-foreground">with Sarah Martinez</p>
                    <Button size="sm" className="mt-2">
                      {t.account?.viewDetails || "View Details"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t.account?.membership || "Membership Status"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className="bg-primary text-primary-foreground">5-Class Pack</Badge>
                    <p className="text-sm text-muted-foreground">3 classes remaining</p>
                    <p className="text-sm text-muted-foreground">Expires: March 15, 2024</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t.account?.upcoming || "Upcoming Classes"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingClasses.map((cls, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 border border-border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{cls.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {cls.date} at {cls.time}
                          </p>
                          <p className="text-sm text-muted-foreground">with {cls.instructor}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          {t.account?.cancel || "Cancel"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t.account?.history || "Class History"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {classHistory.map((cls, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 border border-border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{cls.name}</p>
                          <p className="text-sm text-muted-foreground">{cls.date}</p>
                          <p className="text-sm text-muted-foreground">with {cls.instructor}</p>
                        </div>
                        <Badge variant={cls.status === "completed" ? "default" : "destructive"}>{cls.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="membership" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.account?.currentPlan || "Current Plan"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">5-Class Pack</p>
                      <p className="text-sm text-muted-foreground">3 classes remaining</p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">Active</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button>{t.account?.upgrade || "Upgrade Plan"}</Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      {t.account?.invoice || "Download Invoice"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.account?.profile || "Profile Settings"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{t.account?.firstName || "First Name"}</Label>
                      <Input id="firstName" defaultValue={user.name?.split(" ")[0]} disabled={!isEditing} />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t.account?.lastName || "Last Name"}</Label>
                      <Input id="lastName" defaultValue={user.name?.split(" ")[1]} disabled={!isEditing} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">{t.account?.email || "Email"}</Label>
                    <Input id="email" defaultValue={user.email} disabled={!isEditing} />
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button onClick={() => setIsEditing(false)}>{t.account?.save || "Save Changes"}</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          {t.account?.cancel || "Cancel"}
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>{t.account?.edit || "Edit Profile"}</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
