"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { Clock, Users, Star } from "lucide-react"
import { useState, useEffect } from "react"
import { BookingModal } from "./booking/booking-modal"
import { apiClient } from "@/lib/api-client"
import type { ApiError } from "@/lib/api-client"
import type { ClassType } from "@/lib/types"

interface ClassInstance {
  id: string
  class_type_id: string
  instructor_id: string
  scheduled_date: string
  start_time: string
  end_time: string
  max_capacity: number
  current_bookings: number
  available_spots: number
  price: number
  status: string
  room_name?: string
  class_type_name: string
  class_type_description?: string
  duration: number
  instructor_name?: string
}

export function ClassesSection() {
  const { t } = useLanguage()
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassInstance | null>(null)
  const [classes, setClasses] = useState<ClassInstance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const today = new Date()
        const nextWeek = new Date(today)
        nextWeek.setDate(today.getDate() + 7)
        
        const response = await apiClient.getClassInstances({
          date_from: today.toISOString().split('T')[0],
          date_to: nextWeek.toISOString().split('T')[0],
          status: 'scheduled',
          limit: 20
        })
        
        if (response.success && response.data) {
          setClasses(response.data)
        } else {
          throw new Error(response.message || 'Failed to fetch classes')
        }
      } catch (err) {
        const errorMessage = (err as ApiError).message || 'Failed to load classes'
        setError(errorMessage)
        console.error('Failed to fetch classes:', err)
        
        // Fallback mock data
        setClasses([
          {
            id: "1",
            class_type_id: "1",
            instructor_id: "1", 
            scheduled_date: new Date().toISOString().split('T')[0],
            start_time: "09:00:00",
            end_time: "10:00:00",
            max_capacity: 12,
            current_bookings: 8,
            available_spots: 4,
            price: 25.0,
            status: "scheduled",
            room_name: "Studio A",
            class_type_name: "Yoga Flow",
            class_type_description: "Flow through mindful movements and find your inner peace",
            duration: 60,
            instructor_name: "Emma Wilson"
          },
          {
            id: "2", 
            class_type_id: "2",
            instructor_id: "2",
            scheduled_date: new Date().toISOString().split('T')[0],
            start_time: "18:30:00", 
            end_time: "19:15:00",
            max_capacity: 8,
            current_bookings: 6,
            available_spots: 2,
            price: 30.0,
            status: "scheduled",
            room_name: "Studio B", 
            class_type_name: "Pilates Core",
            class_type_description: "Strengthen your core and improve flexibility with precision",
            duration: 45,
            instructor_name: "Sarah Johnson"
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchClasses()
  }, [])

  const getClassImage = (className: string): string => {
    const imageMap: Record<string, string> = {
      'yoga': '/yoga-class-with-people-in-peaceful-poses.jpg',
      'pilates': '/pilates-class-with-reformer-equipment.jpg', 
      'meditation': '/meditation-room-with-cushions-and-candles.jpg',
      'fitness': '/fitness-class-with-weights-and-equipment.jpg',
      'hiit': '/fitness-class-with-weights-and-equipment.jpg'
    }
    
    const key = className.toLowerCase()
    return Object.keys(imageMap).find(k => key.includes(k)) 
      ? imageMap[Object.keys(imageMap).find(k => key.includes(k))!]
      : '/modern-wellness-studio-interior-with-yoga-mats-and.jpg'
  }

  const formatTime = (timeString: string): string => {
    try {
      const [hours, minutes] = timeString.split(':')
      const date = new Date()
      date.setHours(parseInt(hours), parseInt(minutes))
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    } catch {
      return timeString
    }
  }

  const handleBookClass = (classItem: ClassInstance) => {
    setSelectedClass(classItem)
    setIsBookingModalOpen(true)
  }

  const convertToClassType = (classInstance: ClassInstance) => {
    return {
      id: classInstance.class_type_id,
      name: classInstance.class_type_name,
      description: classInstance.class_type_description || `Join us for ${classInstance.class_type_name}`,
      duration_minutes: classInstance.duration,
      max_capacity: classInstance.max_capacity,
      difficulty_level: "intermediate" as const,
      price: classInstance.price,
      equipment_needed: [],
      is_active: true
    }
  }

  if (isLoading) {
    return (
      <section id="classes" className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-balance">{t.classes.title}</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Choose from our diverse range of classes designed to meet your wellness goals
            </p>
          </div>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading classes...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section id="classes" className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-balance">{t.classes.title}</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Choose from our diverse range of classes designed to meet your wellness goals
            </p>
          </div>

          {error && (
            <div className="text-center mb-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-yellow-800 text-sm">
                  {error}. Showing sample classes for demo.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center max-w-7xl mx-auto">
            {classes.map((classItem) => (
              <Card key={classItem.id} className="overflow-hidden hover:shadow-lg transition-shadow w-full max-w-sm">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={getClassImage(classItem.class_type_name) || "/placeholder.svg"}
                    alt={classItem.class_type_name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex items-center justify-between text-base md:text-lg">
                    <span className="text-balance">{classItem.class_type_name}</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      4.8
                    </div>
                  </CardTitle>
                  <CardDescription className="text-sm text-pretty">
                    {classItem.class_type_description || `Join us for ${classItem.class_type_name}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 md:p-6 pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {classItem.duration} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {classItem.available_spots}/{classItem.max_capacity}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                      {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                    </div>
                    <div>
                      {classItem.room_name}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">${classItem.price}</span>
                    <Button 
                      size="sm" 
                      onClick={() => handleBookClass(classItem)}
                      disabled={classItem.available_spots <= 0}
                    >
                      {classItem.available_spots <= 0 ? 'Full' : t.nav.book}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {classes.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No classes available for the next week.</p>
              <p className="text-muted-foreground text-sm mt-2">Please check back later for new classes.</p>
            </div>
          )}
        </div>
      </section>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preselectedClass={selectedClass ? convertToClassType(selectedClass) : undefined}
      />
    </>
  )
}