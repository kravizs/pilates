export interface ClassType {
  id: string
  name: string
  name_fr?: string
  name_es?: string
  description: string
  description_fr?: string
  description_es?: string
  duration_minutes: number
  max_capacity: number
  difficulty_level: "beginner" | "intermediate" | "advanced"
  price: number
  image_url?: string
  equipment_needed: string[]
  is_active: boolean
}

export interface ClassInstance {
  id: string
  class_type_id: string
  class_type: ClassType
  instructor_id: string
  instructor_name: string
  class_date: string
  start_time: string
  end_time: string
  room_name: string
  max_capacity: number
  current_bookings: number
  status: "scheduled" | "cancelled" | "completed"
}

export interface Booking {
  id: string
  user_id: string
  class_instance_id: string
  class_instance: ClassInstance
  booking_status: "confirmed" | "cancelled" | "completed" | "no_show"
  booking_date: string
  payment_status: "pending" | "paid" | "refunded"
  payment_amount: number
}

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  preferred_language: string
  is_admin?: boolean
}

export interface CMSContent {
  id: string
  content_type: "page" | "blog_post" | "announcement"
  slug: string
  title: string
  title_fr?: string
  title_es?: string
  content: string
  content_fr?: string
  content_es?: string
  excerpt?: string
  featured_image_url?: string
  is_published: boolean
  publish_date?: string
  author_id: string
  view_count: number
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  totalUsers: number
  totalBookings: number
  totalRevenue: number
  activeClasses: number
  todayBookings: number
  monthlyGrowth: number
}
