
import { NextResponse } from 'next/server'
import { getDb } from '../../../../lib/mongodb'
import { ObjectId } from 'mongodb'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

interface JwtPayload {
  id: string
}

interface UserDocument {
  _id: ObjectId
  email: string
  password: string
  createdAt: Date
  updatedAt?: Date
  lastLoginAt?: Date
}

interface UpdateUserBody {
  name?: string
  bio?: string
  avatar?: string
  [key: string]: any
}

function validateUpdatePayload(updates: any): updates is UpdateUserBody {
  if (typeof updates !== 'object' || updates === null) {
    return false
  }

  const forbiddenFields = [
    '_id',
    'email',
    'password',
    'createdAt',
    'lastLoginAt',
  ]

  for (const field of Object.keys(updates)) {
    if (forbiddenFields.includes(field)) {
      return false
    }
    if (updates[field] === undefined || updates[field] === null) {
      return false
    }
  }

  return true
}

export async function GET(
  request: Request,
  context: { params: { userId: string } }
) {
  try {
    const { userId } = context.params
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const user = await db.collection<UserDocument>('users').findOne({
      _id: new ObjectId(userId),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { password, ...safeUser } = user
    return NextResponse.json(safeUser)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  context: { params: { userId: string } }
) {
  try {
    const { userId } = context.params
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured')
    }

    const decoded = verify(token, JWT_SECRET) as JwtPayload
    if (decoded.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this user' },
        { status: 403 }
      )
    }

    const updates = await request.json()
    if (!validateUpdatePayload(updates)) {
      return NextResponse.json(
        { error: 'Invalid update payload' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const result = await db.collection<UserDocument>('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, updated: updates })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: { userId: string } }
) {
  try {
    const { userId } = context.params
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured')
    }

    const decoded = verify(token, JWT_SECRET) as JwtPayload
    if (decoded.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this user' },
        { status: 403 }
      )
    }

    const db = await getDb()
    const result = await db.collection<UserDocument>('users').deleteOne({
      _id: new ObjectId(userId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
