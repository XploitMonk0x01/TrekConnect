import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const usersCollection = db.collection('users')

    // Find user
    const user = await usersCollection.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
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

    // Remove password from response and transform user data
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl || null,
      },
      token,
    })
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
