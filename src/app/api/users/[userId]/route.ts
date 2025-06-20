import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { verify } from 'jsonwebtoken' // For token validation

const JWT_SECRET = process.env.JWT_SECRET

interface JwtPayload {
  id: string
  // other fields if present in your JWT
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
    const usersCollection = db.collection('users')

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })

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
  context: { params: { userId: string } }
) {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET not configured for PATCH /api/users/[userId]')
    return NextResponse.json(
      { error: 'Authentication configuration error' },
      { status: 500 }
    )
  }
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
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
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    const { userId: requestUserId } = context.params
    if (decoded.id !== requestUserId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own profile' },
        { status: 403 }
      )
    }

    if (!ObjectId.isValid(requestUserId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    const updates = await request.json()

    // Don't allow updating sensitive fields directly or critical identifiers
    const { password, email, _id, createdAt, lastLoginAt, ...allowedUpdates } =
      updates

    const db = await getDb()
    const usersCollection = db.collection('users')

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(requestUserId) },
      {
        $set: {
          ...allowedUpdates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after', projection: { password: 0 } } // Exclude password
    )

    if (!result) {
      return NextResponse.json(
        { error: 'User not found or update failed' },
        { status: 404 }
      )
    }

    return NextResponse.json(result) // result is already userWithoutPassword due to projection
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error during user update' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: { userId: string } }
) {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET not configured for DELETE /api/users/[userId]')
    return NextResponse.json(
      { error: 'Authentication configuration error' },
      { status: 500 }
    )
  }

  // Placeholder for DELETE functionality
  // TODO: Implement proper user deletion logic
  // 1. Verify JWT token to ensure the user is authorized to delete this account (usually only themselves).
  // 2. Delete user from MongoDB.
  // 3. Consider implications: what happens to their content (stories, photos)? Cascade delete or anonymize?

  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
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
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    const { userId: userIdToDelete } = context.params

    if (decoded.id !== userIdToDelete) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own account' },
        { status: 403 }
      )
    }

    if (!ObjectId.isValid(userIdToDelete)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    //
    // Actual deletion logic needs to be implemented here
    // For example:
    // const db = await getDb();
    // const usersCollection = db.collection('users');
    // const deleteResult = await usersCollection.deleteOne({ _id: new ObjectId(userIdToDelete) });
    // if (deleteResult.deletedCount === 0) {
    //   return NextResponse.json({ error: 'User not found or already deleted' }, { status: 404 });
    // }
    // Also, consider deleting related content (photos, stories, etc.) or anonymizing it.
    //

    // For now, returning a "Not Implemented" or a success to allow frontend testing
    // console.warn(`DELETE /api/users/${userIdToDelete} - Backend not fully implemented.`);
    // return NextResponse.json({ message: `Account deletion for user ${userIdToDelete} initiated (backend not fully implemented).` }, { status: 501 });

    const db = await getDb()
    const usersCollection = db.collection('users')
    const deleteResult = await usersCollection.deleteOne({
      _id: new ObjectId(userIdToDelete),
    })

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: 'User not found or could not be deleted' },
        { status: 404 }
      )
    }

    // Optionally: Invalidate user's sessions/tokens if you have a session store

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting user account:', error)
    return NextResponse.json(
      { error: 'Internal server error during account deletion.' },
      { status: 500 }
    )
  }
}
