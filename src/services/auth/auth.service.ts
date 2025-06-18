// Authentication service for custom MongoDB-based authentication
// This service handles user authentication operations for the TrekConnect application

import type { UserProfile } from '@/lib/types'

export interface AuthUser {
  id: string // MongoDB _id
  email: string
  name: string
  photoUrl?: string | null
}

export interface AuthResponse {
  user: AuthUser
  token: string // JWT
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

// User registration function
export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new AuthError(data.error || 'Failed to sign up')
  }
  return data
}

// User login function
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new AuthError(data.error || 'Failed to sign in')
  }
  return data
}

// JWT token validation function
export async function validateToken(token: string): Promise<AuthUser> {
  const res = await fetch('/api/auth/validate', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new AuthError(data.error || 'Invalid token')
  }
  return data
}

// Fetch user profile by MongoDB ID
export async function getUserById(userId: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`/api/users/${userId}`)

    if (!res.ok) {
      if (res.status === 404) {
        return null
      }
      throw new Error('Failed to fetch user by ID')
    }
    const userProfileData = await res.json()
    return userProfileData as UserProfile
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    return null
  }
}
