import { NextResponse } from 'next/server'
import { verify, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken'
import { getDb } from '@/lib/mongodb'
import { headers } from 'next/headers'
import { ObjectId } from 'mongodb'
import type { UserProfile } from '@/lib/types'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is not defined in the environment variables for token validation.'
  )
}

interface JwtPayload {
  id: string
  email: string
  name: string
  iat: number
  exp: number
}

export async function GET(request: Request) {
  try {
    const headersList = await headers()
    const authHeader = headersList.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided or malformed header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { error: 'No token found after Bearer' },
        { status: 401 }
      )
    }

    let decoded: JwtPayload
    try {
      const verified = verify(token, JWT_SECRET as string)
      decoded = verified as unknown as JwtPayload
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return NextResponse.json({ error: 'Token expired' }, { status: 401 })
      }
      if (error instanceof JsonWebTokenError) {
        return NextResponse.json(
          { error: 'Invalid token signature or structure' },
          { status: 401 }
        )
      }
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!decoded.id || !ObjectId.isValid(decoded.id)) {
      return NextResponse.json(
        { error: 'Invalid token payload or user ID' },
        { status: 401 }
      )
    }

    const db = await getDb()
    const userDoc = await db
      .collection('users')
      .findOne({ _id: new ObjectId(decoded.id) })

    if (!userDoc) {
      return NextResponse.json(
        { error: 'User not found for token ID' },
        { status: 404 }
      )
    }

    const { password, ...userWithoutPassword } = userDoc

    const userForResponse: UserProfile = {
      id: userWithoutPassword._id.toString(),
      email: userWithoutPassword.email,
      name: userWithoutPassword.name,
      photoUrl: userWithoutPassword.photoUrl || null,
      age: userWithoutPassword.age,
      gender: userWithoutPassword.gender,
      bio: userWithoutPassword.bio,
      travelPreferences: userWithoutPassword.travelPreferences || {},
      languagesSpoken: userWithoutPassword.languagesSpoken || [],
      trekkingExperience: userWithoutPassword.trekkingExperience,
      wishlistDestinations: userWithoutPassword.wishlistDestinations || [],
      travelHistory: userWithoutPassword.travelHistory || [],
      plannedTrips: userWithoutPassword.plannedTrips || [],
      badges: userWithoutPassword.badges || [],
      createdAt: userWithoutPassword.createdAt,
      updatedAt: userWithoutPassword.updatedAt,
      lastLoginAt: userWithoutPassword.lastLoginAt,
    }

    return NextResponse.json(userForResponse)
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error during token validation' },
      { status: 500 }
    )
  }
}
