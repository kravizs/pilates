"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface BackButtonProps {
  label?: string
  href?: string
}

export function BackButton({ label = "Back", href }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleBack} className="mb-6 hover:bg-muted">
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  )
}
