
'use server';

import type { Db, WithId, Document } from 'mongodb';
import { ObjectId } from 'mongodb'; // Import ObjectId
import { getDb } from '@/lib/mongodb';
import type { Destination } from '@/lib/types';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

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
  };
}

export async function getAllDestinations(): Promise<Destination[]> {
  try {
    const db: Db = await getDb();
    const destinationsCollection = db.collection<WithId<Document>>('destinations');
    // Sort by name for consistent ordering, can be changed later
    const destinationDocs = await destinationsCollection.find({}).sort({ name: 1 }).toArray(); 
    
    if (!destinationDocs) {
      return [];
    }
    return destinationDocs.map(mapDocToDestination);
  } catch (error) {
    console.error('Error fetching destinations from MongoDB:', error);
    return []; 
  }
}

export async function getDestinationById(id: string): Promise<Destination | null> {
  try {
    const db: Db = await getDb();
    const destinationsCollection = db.collection('destinations');

    if (!ObjectId.isValid(id)) {
      console.warn(`Invalid ID format for getDestinationById: ${id}`);
      return null; 
    }

    const destinationDoc = await destinationsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!destinationDoc) {
      return null;
    }
    return mapDocToDestination(destinationDoc);
  } catch (error) {
    console.error(`Error fetching destination by ID (${id}) from MongoDB:`, error);
    return null;
  }
}
