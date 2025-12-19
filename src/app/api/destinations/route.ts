import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { Destination } from '@/lib/types'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import type { WithId, Document } from 'mongodb'

// Force dynamic rendering - never cache this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Helper function to map MongoDB document to Destination type
function mapDocToDestination(doc: WithId<Document>): Destination {
  return {
    id: doc._id.toString(),
    name: doc.name || 'Unknown Trek',
    description: doc.description || 'No description available.',
    imageUrl: doc.imageUrl || PLACEHOLDER_IMAGE_URL(600, 400),
    country: doc.country || 'India',
    region: doc.region || 'Himalayas',
    attractions: doc.attractions || [],
    travelTips: doc.travelTips || '',
    coordinates: doc.coordinates || undefined,
    averageRating: doc.averageRating || 0,
    aiHint: doc.aiHint || doc.name,
    altitude: doc.altitude || undefined,
    youtubeLink: doc.youtubeLink || undefined,
  }
}

export async function GET() {
  try {
    const db = await getDb()
    const destinationsCollection =
      db.collection<WithId<Document>>('destinations')
    const destinationDocs = await destinationsCollection
      .find({})
      .sort({ name: 1 })
      .toArray()

    const destinations = destinationDocs.map(mapDocToDestination)
    return NextResponse.json(destinations)
  } catch (error) {
    console.error('Error fetching destinations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch destinations' },
      { status: 500 }
    )
  }
}
