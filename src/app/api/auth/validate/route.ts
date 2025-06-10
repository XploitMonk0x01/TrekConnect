import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { getDb } from '@/lib/mongodb'
import { headers } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: Request) {
  try {
    const headersList = headers()
    const token = headersList.get('Authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verify(token, JWT_SECRET) as { id: string }
    const db = await getDb()
    const user = await db.collection('users').findOne({ _id: decoded.id })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      id: user._id.toString(),
      ...userWithoutPassword,
    })
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}

// Configure route to use Edge runtime
export const config = {
  runtime: 'edge',
}
