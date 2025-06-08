
'use server';

import type { Db, WithId, Document } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import type { Destination } from '@/lib/types';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

// Helper function to map MongoDB document to Destination type
function mapDocToDestination(doc: WithId<Document>): Destination {
  return {
    id: doc._id.toString(),
    name: doc.name || 'Unknown Trek',
    description: doc.description || 'No description available.',
    // Ensure imageUrl has a default, Pexels will attempt to overwrite this on client
    imageUrl: doc.imageUrl || PLACEHOLDER_IMAGE_URL(600, 400), 
    country: doc.country || 'India',
    region: doc.region || 'Himalayas',
    attractions: doc.attractions || [],
    travelTips: doc.travelTips || '',
    coordinates: doc.coordinates || undefined,
    averageRating: doc.averageRating || 0,
    aiHint: doc.aiHint || doc.name, // Fallback aiHint to name if not present
  };
}

export async function getAllDestinations(): Promise<Destination[]> {
  try {
    const db: Db = await getDb();
    const destinationsCollection = db.collection<WithId<Document>>('destinations');
    const destinationDocs = await destinationsCollection.find({}).toArray();
    
    if (!destinationDocs) {
      return [];
    }
    return destinationDocs.map(mapDocToDestination);
  } catch (error) {
    console.error('Error fetching destinations from MongoDB:', error);
    // In case of an error, return an empty array or rethrow,
    // depending on how you want to handle errors upstream.
    // Returning an empty array allows the page to render without data.
    return []; 
  }
}

export async function getDestinationById(id: string): Promise<Destination | null> {
  try {
    const db: Db = await getDb();
    // Note: MongoDB _id is an ObjectId, so if 'id' is a string representation,
    // it needs to be converted. However, our mapDocToDestination converts _id.toString() to id.
    // For querying by a string 'id' that was derived from _id.toString(),
    // you'd typically query by _id directly if you have the ObjectId.
    // If your 'id' field in the app is indeed the string version of _id,
    // and you haven't stored it separately, this query might need adjustment
    // or you'd query by another unique field if 'id' isn't _id.
    // For now, assuming 'id' field might exist or we adjust to query by _id if we have it.
    // This example assumes you might have a string 'id' field that matches.
    // A more robust way for querying by _id.toString() would be to convert string id to ObjectId.
    // For simplicity, if the 'id' in Destination type is always _id.toString(),
    // and you want to find by that, you'd filter client-side or add ObjectId conversion.
    // Let's assume for now we might fetch all and filter, or adjust this query.
    // This example will be basic and may need refinement based on actual ID storage.

    const destinations = await getAllDestinations(); // Re-use to simplify; not efficient for single fetch
    const destination = destinations.find(d => d.id === id);
    return destination || null;

    // A more direct MongoDB query would look like this if `id` is the string version of `_id`:
    // import { ObjectId } from 'mongodb';
    // if (!ObjectId.isValid(id)) return null; // Basic validation
    // const destinationDoc = await db.collection('destinations').findOne({ _id: new ObjectId(id) });
    // if (!destinationDoc) return null;
    // return mapDocToDestination(destinationDoc);

  } catch (error) {
    console.error(`Error fetching destination by ID (${id}) from MongoDB:`, error);
    return null;
  }
}
