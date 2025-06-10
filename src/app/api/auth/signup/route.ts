import { compare, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

const SALT_ROUNDS = 10
const JWT_SECRET = process.env.JWT_SECRET

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const usersCollection = db.collection('users')

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password and create user
    const hashedPassword = await hash(password, SALT_ROUNDS)
    const now = new Date()

    const user = {
      email,
      password: hashedPassword,
      name,
      photoUrl: null,
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
      createdAt: now,
      updatedAt: now,
    }

    const result = await usersCollection.insertOne(user)

    // Create auth token
    const token = sign(
      {
        id: result.insertedId.toString(),
        email,
        name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: {
        id: result.insertedId.toString(),
        ...userWithoutPassword,
      },
      token,
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
