import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { altitude } = body

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid destination ID' },
        { status: 400 }
      )
    }

    // Validate altitude if provided
    if (altitude !== null && altitude !== undefined) {
      if (typeof altitude !== 'number' || altitude < 0) {
        return NextResponse.json(
          { error: 'Altitude must be a positive number' },
          { status: 400 }
        )
      }
    }

    const db = await getDb()
    const result = await db.collection('destinations').findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          altitude:
            altitude !== null && altitude !== undefined ? altitude : null,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: result._id.toString(),
      name: result.name,
      altitude: result.altitude,
    })
  } catch (error) {
    console.error('Error updating destination:', error)
    return NextResponse.json(
      { error: 'Failed to update destination' },
      { status: 500 }
    )
  }
}
