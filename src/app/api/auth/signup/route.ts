import { hash } from 'bcryptjs'
import { SignJWT } from 'jose'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { UserProfile } from '@/lib/types' // Assuming UserProfile is adapted

const SALT_ROUNDS = 10
const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables')
}

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format (basic)
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength (basic example: at least 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const usersCollection = db.collection('users')

    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      )
    }

    const hashedPassword = await hash(password, SALT_ROUNDS)
    const now = new Date()

    // Construct the user document according to UserProfile, ensuring all fields are initialized
    const newUserDocument: Omit<UserProfile, 'id'> & { password?: string } = {
      email,
      password: hashedPassword,
      name,
      photoUrl: null, // Initialize with null or a default placeholder
      age: undefined,
      gender: undefined,
      bio: null,
      travelPreferences: {
        soloOrGroup: undefined,
        budget: undefined,
        style: undefined,
      },
      languagesSpoken: [],
      trekkingExperience: undefined,
      wishlistDestinations: [],
      travelHistory: [],
      plannedTrips: [],
      badges: [],
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    }

    const result = await usersCollection.insertOne(newUserDocument)

    if (!result.insertedId) {
      throw new Error('Failed to insert new user into database.')
    }

    const insertedUserId = result.insertedId.toString()

    const token = await new SignJWT({
      id: insertedUserId,
      email: newUserDocument.email,
      name: newUserDocument.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(JWT_SECRET))

    // Prepare user object for response (excluding password)
    const userForResponse: UserProfile = {
      id: insertedUserId,
      email: newUserDocument.email,
      name: newUserDocument.name,
      photoUrl: newUserDocument.photoUrl,
      age: newUserDocument.age,
      gender: newUserDocument.gender,
      bio: newUserDocument.bio,
      travelPreferences: newUserDocument.travelPreferences,
      languagesSpoken: newUserDocument.languagesSpoken,
      trekkingExperience: newUserDocument.trekkingExperience,
      wishlistDestinations: newUserDocument.wishlistDestinations,
      travelHistory: newUserDocument.travelHistory,
      plannedTrips: newUserDocument.plannedTrips,
      badges: newUserDocument.badges,
      createdAt: newUserDocument.createdAt,
      updatedAt: newUserDocument.updatedAt,
      lastLoginAt: newUserDocument.lastLoginAt,
    }

    const response = NextResponse.json({
      user: userForResponse,
      token,
    })
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error during signup' },
      { status: 500 }
    )
  }
}
