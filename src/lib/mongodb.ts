import { MongoClient, MongoClientOptions, Db } from 'mongodb'

if (!process.env.MONGODB_URI) {
  console.error('Environment variables check:')
  console.error('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set')
  console.error('MONGODB_DB_NAME:', process.env.MONGODB_DB_NAME || 'Not set')
  console.error('NODE_ENV:', process.env.NODE_ENV || 'Not set')
  throw new Error('Please add your Mongo URI to .env')
}
if (!process.env.MONGODB_DB_NAME) {
  throw new Error(
    'Please define the MONGODB_DB_NAME environment variable in .env'
  )
}

const uri = process.env.MONGODB_URI
const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  retryReads: true,
  writeConcern: { w: 'majority' },
  heartbeatFrequencyMS: 10000,
  monitorCommands: process.env.NODE_ENV === 'development',
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export async function getDb(): Promise<Db> {
  try {
    const connectedClient = await clientPromise
    if (!process.env.MONGODB_DB_NAME) {
      throw new Error('MONGODB_DB_NAME environment variable is not defined')
    }
    const db = connectedClient.db(process.env.MONGODB_DB_NAME)
    return db
  } catch (error) {
    console.error('❌ MongoDB connection error in getDb():', error)
    throw new Error('Failed to connect to database')
  }
}

export async function getMongoDB(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const connectedClient = await clientPromise
    const db = connectedClient.db(process.env.MONGODB_DB_NAME)
    return { client: connectedClient, db }
  } catch (error) {
    console.error('Error getting MongoDB connection:', error)
    throw new Error('Failed to get database connection')
  }
}

export async function initializeCollections() {
  try {
    const { db } = await getMongoDB()

    const collectionsToEnsure = [
      { name: 'messages', indexes: [
          { key: { roomId: 1 } },
          { key: { senderId: 1 } },
          { key: { receiverId: 1 } },
          { key: { timestamp: -1 } },
          { key: { roomId: 1, timestamp: -1 } },
        ]
      },
      { name: 'users', indexes: [
          {
            key: { email: 1 },
            unique: true,
            partialFilterExpression: { email: { $type: 'string' } },
          },
        ]
      },
      { name: 'destinations', indexes: [{ key: { name: 1 } }] },
      { name: 'photos', indexes: [{ key: { userId: 1 } }, { key: { uploadedAt: -1 } }] },
      { name: 'stories', indexes: [{ key: { userId: 1 } }, { key: { createdAt: -1 } }] },
    ];

    for (const collInfo of collectionsToEnsure) {
      const collection = db.collection(collInfo.name);
      try {
        if (collInfo.indexes && collInfo.indexes.length > 0) {
          await collection.createIndexes(collInfo.indexes as any); // `as any` to bypass strict IndexDescription typing issues if simple keys are used
        }
        console.log(`Collection '${collInfo.name}' and its indexes ensured.`);
      } catch (indexError: any) {
        // Common error code for "NamespaceExists" when collection exists but trying to create it,
        // or "IndexAlreadyExists" / "IndexOptionsConflict"
        if (indexError.code === 48 || indexError.codeName === 'NamespaceExists' || 
            indexError.code === 85 || indexError.codeName === 'IndexAlreadyExists' ||
            indexError.code === 86 || indexError.codeName === 'IndexOptionsConflict') {
          console.warn(`Warning for collection '${collInfo.name}': ${indexError.message}. This might be okay if run multiple times.`);
        } else {
          console.error(`Error ensuring indexes for collection '${collInfo.name}':`, indexError);
        }
      }
    }
    console.log('MongoDB collections and indexes initialization process completed.');
  } catch (error) {
    console.error('Error during initializeCollections:', error);
    // Don't throw error from here, just log it, as it's an initialization routine
  }
}
