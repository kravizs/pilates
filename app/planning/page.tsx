"use client"

import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/i18n"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, MapPin } from "lucide-react"
import { useState } from "react"
import { BackButton } from "@/components/ui/back-button"

export default function PlanningPage() {
  const { language } = useLanguage()
  const t = translations[language]
  const [selectedDate, setSelectedDate] = useState(new Date())

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const timeSlots = [
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ]

  const classes = [
    {
      id: 1,
      name: "Morning Pilates",
      instructor: "Sarah Martinez",
      time: "09:00",
      duration: 50,
      capacity: 12,
      booked: 8,
      day: "Mon",
    },
    {
      id: 2,
      name: "Vinyasa Yoga",
      instructor: "Lucas Dubois",
      time: "18:30",
      duration: 60,
      capacity: 15,
      booked: 12,
      day: "Mon",
    },
    {
      id: 3,
      name: "Barre Fusion",
      instructor: "Emma Thompson",
      time: "10:00",
      duration: 45,
      capacity: 10,
      booked: 10,
      day: "Tue",
    },
    {
      id: 4,
      name: "Core Pilates",
      instructor: "Sarah Martinez",
      time: "12:00",
      duration: 50,
      capacity: 12,
      booked: 6,
      day: "Wed",
    },
    {
      id: 5,
      name: "Hatha Yoga",
      instructor: "Lucas Dubois",
      time: "19:00",
      duration: 60,
      capacity: 15,
      booked: 9,
      day: "Thu",
    },
    {
      id: 6,
      name: "Dance Barre",
      instructor: "Emma Thompson",
      time: "11:00",
      duration: 45,
      capacity: 10,
      booked: 7,
      day: "Fri",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <BackButton />

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            {t.planning?.title || "Class Schedule"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            {t.planning?.subtitle || "Book your favorite classes and plan your wellness journey"}
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">{t.planning?.thisWeek || "This Week"}</h2>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Calendar className="w-4 h-4" />
              {t.planning?.selectDate || "Select Date"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDays.map((day, index) => (
              <div key={day} className="space-y-2">
                <div className="text-center p-2 bg-muted rounded-lg">
                  <p className="font-semibold text-sm">{day}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(Date.now() + index * 24 * 60 * 60 * 1000).getDate()}
                  </p>
                </div>

                <div className="space-y-2">
                  {classes
                    .filter((cls) => cls.day === day)
                    .map((cls) => (
                      <Card key={cls.id} className="border-border hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-sm">{cls.name}</h3>
                              <Badge
                                variant={cls.booked >= cls.capacity ? "destructive" : "secondary"}
                                className="text-xs"
                              >
                                {cls.booked}/{cls.capacity}
                              </Badge>
                            </div>

                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {cls.time} ({cls.duration}min)
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {cls.instructor}
                              </div>
                            </div>

                            <Button size="sm" className="w-full text-xs" disabled={cls.booked >= cls.capacity}>
                              {cls.booked >= cls.capacity ? t.planning?.full || "Full" : t.planning?.book || "Book"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t.planning?.featured || "Featured Classes"}</CardTitle>
              <CardDescription>{t.planning?.featuredDesc || "Popular classes this week"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classes.slice(0, 3).map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{cls.name}</h3>
                      <p className="text-sm text-muted-foreground">with {cls.instructor}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {cls.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {cls.booked}/{cls.capacity}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" disabled={cls.booked >= cls.capacity}>
                      {cls.booked >= cls.capacity ? t.planning?.full || "Full" : t.planning?.book || "Book"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.planning?.info || "Studio Info"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-1" />
                <div>
                  <p className="font-medium text-sm">Hi Studio</p>
                  <p className="text-xs text-muted-foreground">123 Wellness Street</p>
                  <p className="text-xs text-muted-foreground">Paris, France</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-sm">{t.planning?.policies || "Booking Policies"}</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• {t.planning?.policy1 || "Cancel up to 2 hours before class"}</li>
                  <li>• {t.planning?.policy2 || "Arrive 10 minutes early"}</li>
                  <li>• {t.planning?.policy3 || "Bring your own mat or rent one"}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
