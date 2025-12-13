import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

const normalizeAltitude = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

const normalizeCoordinates = (
  value: unknown
): { lat: number; lng: number } | null => {
  if (!value || typeof value !== 'object') return null
  const v = value as { lat?: unknown; lng?: unknown }
  const lat = typeof v.lat === 'number' ? v.lat : Number(v.lat)
  const lng = typeof v.lng === 'number' ? v.lng : Number(v.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Fetch single destination by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    const db = await getDb()
    const destination = await db
      .collection('destinations')
      .findOne({ _id: new ObjectId(id) })

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(destination)
  } catch (error) {
    console.error('Error fetching destination:', error)
    return NextResponse.json(
      { error: 'Failed to fetch destination' },
      { status: 500 }
    )
  }
}

// PUT - Update destination
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    const body = await request.json()
    const {
      name,
      description,
      imageUrl,
      country,
      region,
      attractions,
      travelTips,
      coordinates,
      altitude,
      aiHint,
    } = body

    const db = await getDb()
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    // Only update provided fields
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (country !== undefined) updateData.country = country
    if (region !== undefined) updateData.region = region
    if (attractions !== undefined) updateData.attractions = attractions
    if (travelTips !== undefined) updateData.travelTips = travelTips
    if (coordinates !== undefined)
      updateData.coordinates = normalizeCoordinates(coordinates)
    if (altitude !== undefined)
      updateData.altitude = normalizeAltitude(altitude)
    if (aiHint !== undefined) updateData.aiHint = aiHint

    const result = await db
      .collection('destinations')
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating destination:', error)
    return NextResponse.json(
      { error: 'Failed to update destination' },
      { status: 500 }
    )
  }
}

// DELETE - Delete destination
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    const db = await getDb()
    const result = await db
      .collection('destinations')
      .deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting destination:', error)
    return NextResponse.json(
      { error: 'Failed to delete destination' },
      { status: 500 }
    )
  }
}
