import { compare, hash } from 'bcryptjs'
import { sign, verify } from 'jsonwebtoken'
import { getDb } from '@/lib/mongodb'
import { UserProfile } from '@/lib/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const SALT_ROUNDS = 10

export interface AuthUser {
  id: string
  email: string
  name: string
  photoUrl: string | null
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

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

  // Transform the response to match our AuthUser interface
  const transformedUser: AuthUser = {
    id: data.user._id || data.user.id,
    email: data.user.email,
    name: data.user.name || data.user.fullName,
    photoUrl: data.user.photoUrl || null,
  }

  return {
    user: transformedUser,
    token: data.token,
  }
}

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

export async function getUserById(userId: string): Promise<AuthUser | null> {
  try {
    const res = await fetch(`/api/users/${userId}`)

    if (!res.ok) {
      if (res.status === 404) {
        return null
      }
      throw new Error('Failed to fetch user')
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function googleSignIn(googleUser: {
  email: string
  name: string
  picture?: string
}): Promise<AuthResponse> {
  const res = await fetch('/api/auth/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(googleUser),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new AuthError(data.error || 'Failed to sign in with Google')
  }

  return data
}
