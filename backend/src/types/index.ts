// User Types
export interface User {
  id: string;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string;
  fitness_goals?: string;
  preferred_language: 'en' | 'fr' | 'es';
  profile_image_url?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  preferred_language?: 'en' | 'fr' | 'es';
}

export interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string;
  fitness_goals?: string;
  preferred_language?: 'en' | 'fr' | 'es';
  profile_image_url?: string;
}

// Instructor Types
export interface Instructor {
  id: string;
  user_id: string;
  bio?: string;
  specializations: string[];
  certifications: string[];
  years_experience?: number;
  hourly_rate?: number;
  profile_image_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface CreateInstructorDto {
  user_id: string;
  bio?: string;
  specializations: string[];
  certifications: string[];
  years_experience?: number;
  hourly_rate?: number;
}

// Class Types
export interface ClassType {
  id: string;
  name: string;
  name_fr?: string;
  name_es?: string;
  description?: string;
  description_fr?: string;
  description_es?: string;
  duration_minutes: number;
  max_capacity: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  image_url?: string;
  equipment_needed: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateClassTypeDto {
  name: string;
  name_fr?: string;
  name_es?: string;
  description?: string;
  description_fr?: string;
  description_es?: string;
  duration_minutes: number;
  max_capacity: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  equipment_needed: string[];
}

// Class Schedule Types
export interface ClassSchedule {
  id: string;
  class_type_id: string;
  instructor_id?: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string;
  end_time: string;
  room_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  class_type?: ClassType;
  instructor?: Instructor;
}

export interface CreateClassScheduleDto {
  class_type_id: string;
  instructor_id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_name?: string;
}

// Class Instance Types
export interface ClassInstance {
  id: string;
  class_schedule_id?: string;
  class_type_id: string;
  instructor_id?: string;
  class_date: string;
  start_time: string;
  end_time: string;
  room_name?: string;
  max_capacity: number;
  current_bookings: number;
  status: 'scheduled' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
  class_type?: ClassType;
  instructor?: Instructor;
}

export interface CreateClassInstanceDto {
  class_type_id: string;
  instructor_id?: string;
  class_date: string;
  start_time: string;
  end_time: string;
  room_name?: string;
  max_capacity: number;
  notes?: string;
}

// Booking Types
export interface Booking {
  id: string;
  user_id: string;
  class_instance_id: string;
  booking_status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  booking_date: string;
  cancellation_date?: string;
  cancellation_reason?: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_amount?: number;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  class_instance?: ClassInstance;
}

export interface CreateBookingDto {
  class_instance_id: string;
  payment_method?: string;
  notes?: string;
}

// Membership Types
export interface MembershipPlan {
  id: string;
  name: string;
  name_fr?: string;
  name_es?: string;
  description?: string;
  description_fr?: string;
  description_es?: string;
  price: number;
  duration_days: number;
  class_credits?: number;
  is_unlimited: boolean;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserMembership {
  id: string;
  user_id: string;
  membership_plan_id: string;
  start_date: string;
  end_date: string;
  remaining_credits?: number;
  status: 'active' | 'expired' | 'cancelled' | 'paused';
  auto_renew: boolean;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  membership_plan?: MembershipPlan;
}

// Review Types
export interface Review {
  id: string;
  user_id: string;
  class_type_id: string;
  instructor_id?: string;
  rating: number; // 1-5
  comment?: string;
  is_public: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  class_type?: ClassType;
  instructor?: Instructor;
}

export interface CreateReviewDto {
  class_type_id: string;
  instructor_id?: string;
  rating: number;
  comment?: string;
}

// CMS Content Types
export interface CMSContent {
  id: string;
  content_type: 'page' | 'blog_post' | 'announcement';
  slug: string;
  title: string;
  title_fr?: string;
  title_es?: string;
  content?: string;
  content_fr?: string;
  content_es?: string;
  excerpt?: string;
  excerpt_fr?: string;
  excerpt_es?: string;
  featured_image_url?: string;
  meta_description?: string;
  meta_keywords: string[];
  is_published: boolean;
  publish_date?: string;
  author_id?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  author?: User;
}

// Waitlist Types
export interface Waitlist {
  id: string;
  user_id: string;
  class_instance_id: string;
  position: number;
  status: 'waiting' | 'notified' | 'booked' | 'expired';
  notification_sent_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  class_instance?: ClassInstance;
}

// Auth Types
export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'client' | 'coach' | 'admin';
  isAdmin: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeClasses: number;
  todayBookings: number;
  monthlyGrowth: number;
  recentBookings: Booking[];
  upcomingClasses: ClassInstance[];
}

// Error Types
export interface APIError extends Error {
  status: number;
  code: string;
  details?: any;
}

// Request Extensions
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}