import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { verify } from 'jsonwebtoken'
import { hash, compare } from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET
const SALT_ROUNDS = 10

interface JwtPayload {
  id: string
  // other fields if present
}

export async function POST(req: Request) {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET not configured for /api/auth/change-password')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      )
    }

    let decoded: JwtPayload
    try {
      decoded = verify(token, JWT_SECRET) as JwtPayload
    } catch (err) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      )
    }

    const { userId, currentPassword, newPassword } = await req.json()

    if (decoded.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: User ID mismatch' },
        { status: 403 }
      )
    }

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const usersCollection = db.collection('users')
    const userDoc = await usersCollection.findOne({ _id: new ObjectId(userId) })

    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!userDoc.password) {
      return NextResponse.json(
        {
          error:
            'Cannot change password for this account type (e.g., social login without password set).',
        },
        { status: 400 }
      )
    }

    const isCurrentPasswordValid = await compare(
      currentPassword,
      userDoc.password
    )
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Incorrect current password' },
        { status: 401 }
      )
    }

    const hashedNewPassword = await hash(newPassword, SALT_ROUNDS)

    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedNewPassword, updatedAt: new Date() } }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Password changed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Internal server error during password change' },
      { status: 500 }
    )
  }
}
