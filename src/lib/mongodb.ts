import { MongoClient, MongoClientOptions, Db } from 'mongodb'
import { config } from 'dotenv'

config()

// Ensure environment variables are set
if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}
if (!process.env.MONGODB_DB_NAME) {
  throw new Error('Please define the MONGODB_DB_NAME environment variable')
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

const uri = process.env.MONGODB_URI
const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  writeConcern: { w: 'majority' },
}

let clientPromise: Promise<MongoClient>

let client: MongoClient
let mongoClientPromise: Promise<MongoClient>

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

// Export a module-scoped MongoClient promise
export default clientPromise

export async function getDb() {
  try {
    const client = await clientPromise
    if (!process.env.MONGODB_DB_NAME) {
      throw new Error('MONGODB_DB_NAME environment variable is not defined')
    }
    return client.db(process.env.MONGODB_DB_NAME)
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw new Error('Failed to connect to database')
  }
}

export async function getMongoDB(): Promise<{ client: MongoClient; db: Db }> {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB_NAME)
  return { client, db }
}

export async function initializeCollections() {
  try {
    const { db } = await getMongoDB()

    // Create messages collection if it doesn't exist
    const messagesCollection = db.collection('messages')

    // Create indexes for messages collection
    await messagesCollection.createIndexes([
      { key: { roomId: 1 } }, // Index for querying messages by room
      { key: { senderId: 1 } }, // Index for querying messages by sender
      { key: { receiverId: 1 } }, // Index for querying messages by receiver
      { key: { timestamp: -1 } }, // Index for sorting messages by time
      { key: { roomId: 1, timestamp: -1 } }, // Compound index for efficient room message queries
    ])

    // Create users collection if it doesn't exist
    const usersCollection = db.collection('users')

    // Drop existing indexes to avoid conflicts
    await usersCollection.dropIndexes().catch(() => {
      // Ignore error if no indexes exist
    })

    // Create indexes for users collection with validation
    await usersCollection.createIndexes([
      {
        key: { email: 1 },
        unique: true,
        partialFilterExpression: { email: { $type: 'string' } },
      },
      {
        key: { username: 1 },
        unique: true,
        partialFilterExpression: { username: { $type: 'string' } },
      },
    ])

    // Add validation to ensure required fields
    await db.command({
      collMod: 'users',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'username'],
          properties: {
            email: {
              bsonType: 'string',
              pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            },
            username: {
              bsonType: 'string',
              minLength: 3,
              maxLength: 30,
            },
          },
        },
      },
    })

    console.log('MongoDB collections and indexes initialized successfully')
  } catch (error) {
    console.error('Error initializing MongoDB collections:', error)
    throw error
  }
}

// Initialize collections when the module is imported
initializeCollections().catch(console.error)
