interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any[];
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('hi-studio-token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('hi-studio-token', token);
      } else {
        localStorage.removeItem('hi-studio-token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add auth header if token exists
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = new Error(data.message || 'API request failed');
        error.status = response.status;
        error.code = data.code;
        error.details = data.details;
        throw error;
      }

      return data;
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        // Handle 401 Unauthorized - token expired/invalid
        if ((error as ApiError).status === 401) {
          this.setToken(null);
          // Redirect to login if we're in browser
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }
        throw error;
      }
      
      // Network or other errors
      const apiError: ApiError = new Error('Network error or server unavailable');
      apiError.status = 0;
      throw apiError;
    }
  }

  // HTTP Methods
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      url += `?${searchParams.toString()}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.post<{ user: any; token: string }>('/auth/login', {
      email,
      password,
    });
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    preferred_language?: string;
  }) {
    const response = await this.post<{ user: any; token: string }>('/auth/register', userData);
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async getProfile() {
    return this.get<any>('/auth/profile');
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, clear local token
      console.warn('Logout request failed, but clearing local token');
    } finally {
      this.setToken(null);
    }
  }

  // Classes endpoints
  async getClassTypes() {
    return this.get<any[]>('/class-types');
  }

  async getClassInstances(params?: {
    type_id?: string;
    date_from?: string;
    date_to?: string;
    instructor_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    return this.get<any[]>('/classes', params);
  }

  async getClassInstance(id: string) {
    return this.get<any>(`/classes/${id}`);
  }

  // Bookings endpoints
  async getBookings(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    return this.get<any[]>('/bookings', params);
  }

  async createBooking(bookingData: {
    class_instance_id: string;
    payment_method?: string;
    special_requests?: string;
  }) {
    return this.post<any>('/bookings', bookingData);
  }

  async cancelBooking(id: string, reason?: string) {
    return this.delete<any>(`/bookings/${id}`);
  }

  // Admin endpoints
  async getDashboardOverview() {
    return this.get<any>('/dashboard/overview');
  }

  async getUsers(params?: {
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    return this.get<any[]>('/users', params);
  }

  // Payments endpoints
  async createPaymentIntent(paymentData: {
    amount: number;
    currency: string;
    payment_type: 'membership' | 'booking' | 'package';
    membership_plan_id?: string;
    class_instance_id?: string;
  }) {
    return this.post<{ client_secret: string }>('/payments/create-payment-intent', paymentData);
  }

  async getPaymentHistory(params?: {
    payment_type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    return this.get<any[]>('/payments/history', params);
  }
}

// Create singleton instance
export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
);

export default apiClient;

// Export types for use in components
export type { ApiResponse, ApiError };