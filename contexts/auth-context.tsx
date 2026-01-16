"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@/lib/types"
import { apiClient } from "@/lib/api-client"
import type { ApiError } from "@/lib/api-client"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: Partial<User> & { password: string }) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has valid token and get profile
    const initAuth = async () => {
      const token = apiClient.getToken()
      if (token) {
        try {
          const response = await apiClient.getProfile()
          if (response.success && response.data) {
            setUser(response.data)
          }
        } catch (error) {
          // Token is invalid, will be cleared by apiClient
          console.warn('Invalid token, user logged out')
        }
      }
      setIsLoading(false)
    }
    
    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.login(email, password)
      console.log("Login response:", response)  
      if (response.success && response.data) {
        setUser(response.data.user)
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      const errorMessage = (error as ApiError).message || 'Login failed'
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true)
    try {
      const response = await apiClient.register({
        email: userData.email!,
        password: userData.password,
        first_name: userData.first_name!,
        last_name: userData.last_name!,
        phone: userData.phone,
        preferred_language: userData.preferred_language || "en",
      })
      if (response.success && response.data) {
        setUser(response.data.user)
      } else {
        throw new Error(response.message || 'Registration failed')
      }
    } catch (error) {
      const errorMessage = (error as ApiError).message || 'Registration failed'
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    apiClient.logout()
  }

  const isAdmin = user?.is_admin || false

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
