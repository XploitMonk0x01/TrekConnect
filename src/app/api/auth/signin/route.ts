import { compare } from 'bcryptjs'
import { SignJWT } from 'jose'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { UserProfile } from '@/lib/types' // Assuming UserProfile is adapted
import { ObjectId } from 'mongodb'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables')
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email and password' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const usersCollection = db.collection('users')

    const userDoc = await usersCollection.findOne({ email })
    if (!userDoc) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const isValidPassword = await compare(password, userDoc.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Update lastLoginAt - use a simpler approach to avoid validation issues
    try {
      await usersCollection.updateOne(
        { _id: userDoc._id },
        { $set: { lastLoginAt: new Date() } }
      )
    } catch (error) {
      console.log(
        'Failed to update lastLoginAt, continuing with signin:',
        error
      )
      // Continue with signin even if update fails
    }

    const effectiveUserDoc = userDoc

    const token = await new SignJWT({
      id: effectiveUserDoc._id.toString(),
      email: effectiveUserDoc.email,
      name: effectiveUserDoc.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(JWT_SECRET))

    // Prepare user object for response (excluding password)
    const { password: _, ...userSafeForResponse } = effectiveUserDoc

    const userForResponse: UserProfile = {
      id: effectiveUserDoc._id.toString(),
      email: userSafeForResponse.email,
      name: userSafeForResponse.name,
      photoUrl: userSafeForResponse.photoUrl || null,
      age: userSafeForResponse.age,
      gender: userSafeForResponse.gender,
      bio: userSafeForResponse.bio,
      travelPreferences: userSafeForResponse.travelPreferences || {},
      languagesSpoken: userSafeForResponse.languagesSpoken || [],
      trekkingExperience: userSafeForResponse.trekkingExperience,
      wishlistDestinations: userSafeForResponse.wishlistDestinations || [],
      travelHistory: userSafeForResponse.travelHistory || [],
      plannedTrips: userSafeForResponse.plannedTrips || [],
      badges: userSafeForResponse.badges || [],
      createdAt: userSafeForResponse.createdAt,
      updatedAt: userSafeForResponse.updatedAt,
      lastLoginAt: userSafeForResponse.lastLoginAt,
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
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Internal server error during signin' },
      { status: 500 }
    )
  }
}
