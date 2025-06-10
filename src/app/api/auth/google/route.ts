import { NextResponse } from 'next/server'
import { sign } from 'jsonwebtoken'
import { getDb } from '@/lib/mongodb'

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(req: Request) {
  try {
    const { email, name, picture } = await req.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const usersCollection = db.collection('users')

    // Check if user exists
    let user = await usersCollection.findOne({ email })

    if (!user) {
      // Create new user if doesn't exist
      const now = new Date()
      user = {
        email,
        name,
        photoUrl: picture || null,
        age: null,
        gender: null,
        bio: null,
        travelPreferences: {
          soloOrGroup: null,
          budget: null,
          style: null,
        },
        languagesSpoken: [],
        trekkingExperience: null,
        wishlistDestinations: [],
        travelHistory: [],
        plannedTrips: [],
        badges: [],
        googleAuth: true,
        createdAt: now,
        updatedAt: now,
      }

      const result = await usersCollection.insertOne(user)
      user._id = result.insertedId
    }

    // Create auth token
    const token = sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
      },
      token,
    })
  } catch (error) {
    console.error('Google sign in error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
