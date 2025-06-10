import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId
    const db = await getDb()
    const usersCollection = db.collection('users')

    const user = await usersCollection.findOne({ _id: userId })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
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
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId
    const updates = await request.json()

    // Don't allow updating sensitive fields
    const { password, email, _id, ...allowedUpdates } = updates

    const db = await getDb()
    const usersCollection = db.collection('users')

    const result = await usersCollection.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          ...allowedUpdates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove sensitive data
    const { password: _, ...userWithoutPassword } = result

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
