import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDb()
    const usersCollection = db.collection('users')

    const users = await usersCollection
      .find({})
      .project({ password: 0 }) // Exclude password field
      .toArray()

    // Convert MongoDB _id to string id
    const formattedUsers = users.map((user) => ({
      id: user._id.toString(),
      ...user,
      _id: undefined,
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
