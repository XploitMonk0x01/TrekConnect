import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// Use a fallback secret if not configured
const getAdminSecret = () => {
  const secret = process.env.ADMIN_JWT_SECRET

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_JWT_SECRET must be set in production')
    }
    return new TextEncoder().encode('trekconnect-default-admin-secret-2025')
  }
  return new TextEncoder().encode(secret)
}

const COOKIE_NAME = 'admin_session'

export interface AdminSession {
  isAdmin: boolean
  loginTime: number
}

// Validate admin credentials against ENV
export function validateAdminCredentials(
  username: string,
  password: string
): boolean {
  const adminUsername = process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminUsername || !adminPassword) {
    console.error('Admin credentials not configured in environment variables')
    return false
  }

  return username === adminUsername && password === adminPassword
}

// Create admin session token
export async function createAdminSession(): Promise<string> {
  const token = await new SignJWT({ isAdmin: true, loginTime: Date.now() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getAdminSecret())

  return token
}

// Verify admin session token
export async function verifyAdminSession(
  token: string
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getAdminSecret())
    return payload as unknown as AdminSession
  } catch (error) {
    console.error('Session verification failed:', error)
    return null
  }
}

// Get admin session from cookies (for server components)
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null
  return verifyAdminSession(token)
}

// Check if current request is authenticated as admin
export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession()
  return session?.isAdmin === true
}
