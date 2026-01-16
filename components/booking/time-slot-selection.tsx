"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import type { ClassType, ClassInstance } from "@/lib/types"
import { Clock, ArrowLeft } from "lucide-react"

interface TimeSlotSelectionProps {
  classType: ClassType
  onSelect: (timeSlot: ClassInstance) => void
  onBack: () => void
}

export function TimeSlotSelection({ classType, onSelect, onBack }: TimeSlotSelectionProps) {
  const { t, language } = useLanguage()
  const [selectedDate, setSelectedDate] = useState<string>("")

  const generateTimeSlots = (): ClassInstance[] => {
    const slots: ClassInstance[] = []
    const today = new Date()

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateStr = date.toISOString().split("T")[0]

      // Morning slot
      slots.push({
        id: `${classType.id}-${dateStr}-morning`,
        class_type_id: classType.id,
        class_type: classType,
        instructor_id: "1",
        instructor_name: "Sarah Johnson",
        class_date: dateStr,
        start_time: "09:00",
        end_time: "10:00",
        room_name: "Studio A",
        max_capacity: classType.max_capacity,
        current_bookings: Math.floor(Math.random() * classType.max_capacity),
        status: "scheduled",
      })

      // Evening slot
      slots.push({
        id: `${classType.id}-${dateStr}-evening`,
        class_type_id: classType.id,
        class_type: classType,
        instructor_id: "2",
        instructor_name: "Mike Chen",
        class_date: dateStr,
        start_time: "18:30",
        end_time: "19:30",
        room_name: "Studio B",
        max_capacity: classType.max_capacity,
        current_bookings: Math.floor(Math.random() * classType.max_capacity),
        status: "scheduled",
      })
    }

    return slots
  }

  const timeSlots = generateTimeSlots()
  const dates = [...new Set(timeSlots.map((slot) => slot.class_date))]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr
  }

  const getAvailabilityStatus = (slot: ClassInstance) => {
    const available = slot.max_capacity - slot.current_bookings
    if (available === 0) return { status: "full", color: "bg-red-100 text-red-800" }
    if (available <= 2) return { status: "limited", color: "bg-yellow-100 text-yellow-800" }
    return { status: "available", color: "bg-green-100 text-green-800" }
  }

  const getLocalizedName = (classType: ClassType) => {
    if (language === "fr" && classType.name_fr) return classType.name_fr
    if (language === "es" && classType.name_es) return classType.name_es
    return classType.name
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h3 className="text-lg font-semibold">{getLocalizedName(classType)}</h3>
          <p className="text-sm text-muted-foreground">
            ${classType.price} • {classType.duration_minutes} min
          </p>
        </div>
      </div>

      {/* Date Selection */}
      <div className="space-y-4">
        <h4 className="font-medium">Select Date</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {dates.map((date) => (
            <Button
              key={date}
              variant={selectedDate === date ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDate(date)}
              className="text-xs"
            >
              {formatDate(date)}
            </Button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="space-y-4">
          <h4 className="font-medium">Available Times</h4>
          <div className="grid gap-3">
            {timeSlots
              .filter((slot) => slot.class_date === selectedDate)
              .map((slot) => {
                const availability = getAvailabilityStatus(slot)
                const spotsLeft = slot.max_capacity - slot.current_bookings

                return (
                  <Card key={slot.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </span>
                            <Badge className={availability.color}>
                              {spotsLeft === 0 ? "Full" : `${spotsLeft} spots left`}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Instructor: {slot.instructor_name}</span>
                            <span>Room: {slot.room_name}</span>
                          </div>
                        </div>
                        <Button onClick={() => onSelect(slot)} disabled={spotsLeft === 0}>
                          {spotsLeft === 0 ? "Full" : "Book Now"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
