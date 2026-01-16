"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { ClassSelection } from "./class-selection"
import { TimeSlotSelection } from "./time-slot-selection"
import { BookingConfirmation } from "./booking-confirmation"
import { MindBodyTimeSlotSelection } from "./mindbody-time-slot-selection"
import { MindBodyBookingConfirmation } from "./mindbody-booking-confirmation"
import { AuthForm } from "./auth-form"
import type { ClassType, ClassInstance } from "@/lib/types"
import type { MindBodyClass } from "@/lib/mindbody-api"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedClass?: ClassType
}

type BookingStep = "auth" | "class-selection" | "time-selection" | "confirmation"
type BookingSystem = "internal" | "mindbody"

export function BookingModal({ isOpen, onClose, preselectedClass }: BookingModalProps) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<BookingStep>("class-selection")
  const [bookingSystem, setBookingSystem] = useState<BookingSystem>("internal")
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(preselectedClass || null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<ClassInstance | null>(null)
  const [selectedMindBodyClass, setSelectedMindBodyClass] = useState<MindBodyClass | null>(null)

  useState(() => {
    if (isOpen) {
      if (!user) {
        setCurrentStep("auth")
      } else {
        setCurrentStep(preselectedClass ? "time-selection" : "class-selection")
      }
      setSelectedClass(preselectedClass || null)
      setSelectedTimeSlot(null)
      setSelectedMindBodyClass(null)
      setBookingSystem("internal")
    }
  })

  const handleClassSelect = (classType: ClassType) => {
    setSelectedClass(classType)
    setCurrentStep("time-selection")
  }

  const handleTimeSlotSelect = (timeSlot: ClassInstance) => {
    setSelectedTimeSlot(timeSlot)
    setBookingSystem("internal")
    setCurrentStep("confirmation")
  }

  const handleMindBodyClassSelect = (mindBodyClass: MindBodyClass) => {
    setSelectedMindBodyClass(mindBodyClass)
    setBookingSystem("mindbody")
    setCurrentStep("confirmation")
  }

  const handleBookingComplete = () => {
    onClose()
    // Reset state
    setCurrentStep("class-selection")
    setSelectedClass(null)
    setSelectedTimeSlot(null)
    setSelectedMindBodyClass(null)
    setBookingSystem("internal")
  }

  const handleAuthComplete = () => {
    setCurrentStep(preselectedClass ? "time-selection" : "class-selection")
  }

  const renderStep = () => {
    switch (currentStep) {
      case "auth":
        return <AuthForm onComplete={handleAuthComplete} />
      case "class-selection":
        return <ClassSelection onSelect={handleClassSelect} />
      case "time-selection":
        return (
          <Tabs defaultValue="internal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="internal">Hi Studio Schedule</TabsTrigger>
              <TabsTrigger value="mindbody">MindBody Integration</TabsTrigger>
            </TabsList>

            <TabsContent value="internal" className="mt-6">
              <TimeSlotSelection
                classType={selectedClass!}
                onSelect={handleTimeSlotSelect}
                onBack={() => setCurrentStep("class-selection")}
              />
            </TabsContent>

            <TabsContent value="mindbody" className="mt-6">
              <MindBodyTimeSlotSelection
                classType={selectedClass!}
                onSelect={handleMindBodyClassSelect}
                onBack={() => setCurrentStep("class-selection")}
              />
            </TabsContent>
          </Tabs>
        )
      case "confirmation":
        if (bookingSystem === "mindbody" && selectedMindBodyClass) {
          return (
            <MindBodyBookingConfirmation
              mindBodyClass={selectedMindBodyClass}
              onComplete={handleBookingComplete}
              onBack={() => setCurrentStep("time-selection")}
            />
          )
        } else if (bookingSystem === "internal" && selectedTimeSlot) {
          return (
            <BookingConfirmation
              classInstance={selectedTimeSlot}
              onComplete={handleBookingComplete}
              onBack={() => setCurrentStep("time-selection")}
            />
          )
        }
        return null
      default:
        return null
    }
  }

  const getTitle = () => {
    if (currentStep === "auth") return "Sign In to Book"
    if (currentStep === "class-selection") return t.booking.selectClass
    if (currentStep === "time-selection") return t.booking.selectTime
    if (currentStep === "confirmation") {
      return bookingSystem === "mindbody" ? "Confirm MindBody Booking" : t.booking.confirm
    }
    return ""
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  )
}
