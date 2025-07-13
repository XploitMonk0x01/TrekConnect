// This is a backup of the original MongoDB configuration
// Kept for reference while migrating to Firebase

import { MongoClient, MongoClientOptions, Db } from 'mongodb'

// MongoDB Connection Configuration
const MONGODB_CONFIG = {
  uri: process.env.MONGODB_URI,
  dbName: process.env.MONGODB_DB_NAME,
  options: {
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
  } as MongoClientOptions,
}

// Collection Structure
export const COLLECTIONS = {
  messages: {
    name: 'messages',
    indexes: [
      { key: { roomId: 1 } },
      { key: { senderId: 1 } },
      { key: { receiverId: 1 } },
      { key: { timestamp: -1 } },
      { key: { roomId: 1, timestamp: -1 } },
    ],
  },
  users: {
    name: 'users',
    indexes: [
      {
        key: { email: 1 },
        unique: true,
        partialFilterExpression: { email: { $type: 'string' } },
      },
    ],
  },
  destinations: {
    name: 'destinations',
    indexes: [{ key: { name: 1 } }],
  },
  photos: {
    name: 'photos',
    indexes: [{ key: { userId: 1 } }, { key: { uploadedAt: -1 } }],
  },
  stories: {
    name: 'stories',
    indexes: [{ key: { userId: 1 } }, { key: { createdAt: -1 } }],
  },
}

// Original MongoDB Connection Code
let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!MONGODB_CONFIG.uri || !MONGODB_CONFIG.dbName) {
  console.error('Environment variables check:')
  console.error('MONGODB_URI:', MONGODB_CONFIG.uri ? 'Set' : 'Not set')
  console.error('MONGODB_DB_NAME:', MONGODB_CONFIG.dbName || 'Not set')
  console.error('NODE_ENV:', process.env.NODE_ENV || 'Not set')
  throw new Error('Required MongoDB environment variables are not set')
}

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(MONGODB_CONFIG.uri, MONGODB_CONFIG.options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(MONGODB_CONFIG.uri, MONGODB_CONFIG.options)
  clientPromise = client.connect()
}

export async function getDb(): Promise<Db> {
  try {
    const connectedClient = await clientPromise
    const db = connectedClient.db(MONGODB_CONFIG.dbName)
    return db
  } catch (error) {
    console.error('❌ MongoDB connection error in getDb():', error)
    throw new Error('Failed to connect to database')
  }
}

export async function getMongoDB(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const connectedClient = await clientPromise
    const db = connectedClient.db(MONGODB_CONFIG.dbName)
    return { client: connectedClient, db }
  } catch (error) {
    console.error('Error getting MongoDB connection:', error)
    throw new Error('Failed to get database connection')
  }
}

export async function initializeCollections() {
  try {
    const { db } = await getMongoDB()

    for (const collInfo of Object.values(COLLECTIONS)) {
      const collection = db.collection(collInfo.name)
      try {
        if (collInfo.indexes && collInfo.indexes.length > 0) {
          await collection.createIndexes(collInfo.indexes as any)
        }
        console.log(`Collection '${collInfo.name}' and its indexes ensured.`)
      } catch (indexError: any) {
        if (
          indexError.code === 48 ||
          indexError.codeName === 'NamespaceExists' ||
          indexError.code === 85 ||
          indexError.codeName === 'IndexAlreadyExists' ||
          indexError.code === 86 ||
          indexError.codeName === 'IndexOptionsConflict'
        ) {
          console.warn(
            `Warning for collection '${collInfo.name}': ${indexError.message}. This might be okay if run multiple times.`
          )
        } else {
          console.error(
            `Error ensuring indexes for collection '${collInfo.name}':`,
            indexError
          )
        }
      }
    }
    console.log(
      'MongoDB collections and indexes initialization process completed.'
    )
  } catch (error) {
    console.error('Error during initializeCollections:', error)
  }
}

export default clientPromise
