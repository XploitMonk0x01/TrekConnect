import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { isAdminAuthenticated } from '@/lib/admin-auth'

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

// GET - Fetch all destinations
export async function GET() {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    const destinations = await db
      .collection('destinations')
      .find({})
      .sort({ name: 1 })
      .toArray()

    return NextResponse.json(destinations)
  } catch (error) {
    console.error('Error fetching destinations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch destinations' },
      { status: 500 }
    )
  }
}

// POST - Create new destination
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      averageRating,
      youtubeLink,
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const db = await getDb()
    const newDestination = {
      name,
      description: description || '',
      imageUrl: imageUrl || '',
      country: country || 'India',
      region: region || 'Himalayas',
      attractions: attractions || [],
      travelTips: travelTips || '',
      coordinates: normalizeCoordinates(coordinates),
      altitude: normalizeAltitude(altitude),
      aiHint: aiHint || name.toLowerCase(),
      averageRating: normalizeAltitude(averageRating) ?? 0,
      youtubeLink: youtubeLink || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('destinations').insertOne(newDestination)

    return NextResponse.json(
      { success: true, id: result.insertedId.toString() },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating destination:', error)
    return NextResponse.json(
      { error: 'Failed to create destination' },
      { status: 500 }
    )
  }
}
