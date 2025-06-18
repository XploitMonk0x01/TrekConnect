'use client'

import type { UserProfile } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

interface AuthContextType {
  user: UserProfile | null
  token: string | null
  isLoading: boolean
  signIn: (email_param: string, password_param: string) => Promise<boolean>
  signUp: (
    name_param: string,
    email_param: string,
    password_param: string
  ) => Promise<boolean>
  signOut: () => void
  validateSession: () => Promise<void>
  updateUserInContext: (updatedUser: UserProfile) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const CustomAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const initializeAuth = async () => {
      setIsLoading(true)
      try {
        // Check if user is authenticated by calling validate endpoint
        const response = await fetch('/api/auth/validate', {
          credentials: 'include', // Include cookies
        })
        if (response.ok) {
          const userData: UserProfile = await response.json()
          setUser(userData)
          // Get token from cookies if needed for client-side operations
          const cookies = document.cookie.split(';')
          const authCookie = cookies.find((cookie) =>
            cookie.trim().startsWith('authToken=')
          )
          if (authCookie) {
            const tokenValue = authCookie.split('=')[1]
            setToken(tokenValue)
          }
        } else {
          setUser(null)
          setToken(null)
        }
      } catch (error) {
        console.error('Session validation error:', error)
        setUser(null)
        setToken(null)
      }
      setIsLoading(false)
    }
    initializeAuth()
  }, [mounted])

  const signIn = async (
    email_param: string,
    password_param: string
  ): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email: email_param, password: password_param }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Sign-in failed')
      }
      setUser(data.user)
      setToken(data.token)
      setIsLoading(false)
      return true
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign In Error',
        description: error.message,
      })
      setIsLoading(false)
      return false
    }
  }

  const signUp = async (
    name_param: string,
    email_param: string,
    password_param: string
  ): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          name: name_param,
          email: email_param,
          password: password_param,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Sign-up failed')
      }
      setUser(data.user)
      setToken(data.token)
      setIsLoading(false)
      return true
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Error',
        description: error.message,
      })
      setIsLoading(false)
      return false
    }
  }

  const signOut = async () => {
    try {
      // Call the logout API to clear the server-side cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout API error:', error)
      // Continue with client-side logout even if API call fails
    }

    setUser(null)
    setToken(null)
    router.push('/auth/signin')
  }

  const validateSession = async () => {
    // Only run on client side after mounting
    if (!mounted) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/validate', {
        credentials: 'include', // Include cookies
      })
      if (response.ok) {
        const userData: UserProfile = await response.json()
        setUser(userData)
        // Get token from cookies if needed
        const cookies = document.cookie.split(';')
        const authCookie = cookies.find((cookie) =>
          cookie.trim().startsWith('authToken=')
        )
        if (authCookie) {
          const tokenValue = authCookie.split('=')[1]
          setToken(tokenValue)
        }
      } else {
        setUser(null)
        setToken(null)
      }
    } catch (error) {
      console.error('Manual session validation error:', error)
      setUser(null)
      setToken(null)
    }
    setIsLoading(false)
  }

  const updateUserInContext = (updatedUser: UserProfile) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signIn,
        signUp,
        signOut,
        validateSession,
        updateUserInContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useCustomAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useCustomAuth must be used within an AuthProvider')
  }
  return context
}
