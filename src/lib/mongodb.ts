import { MongoClient, MongoClientOptions, Db } from 'mongodb'

// Next.js automatically loads .env files, so we don't need dotenv here
// Ensure environment variables are set
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

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
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
    console.log('🔍 getDb() called')
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set')
    console.log('MONGODB_DB_NAME:', process.env.MONGODB_DB_NAME || 'Not set')

    const client = await clientPromise
    console.log('✅ Client connected')

    if (!process.env.MONGODB_DB_NAME) {
      throw new Error('MONGODB_DB_NAME environment variable is not defined')
    }

    const db = client.db(process.env.MONGODB_DB_NAME)
    console.log(`✅ Database accessed: ${process.env.MONGODB_DB_NAME}`)
    return db
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw new Error('Failed to connect to database')
  }
}

export async function getMongoDB(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB_NAME)
    return { client, db }
  } catch (error) {
    console.error('Error getting MongoDB connection:', error)
    throw new Error('Failed to get database connection')
  }
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

    // Create indexes for users collection (without dropping existing ones)
    await usersCollection
      .createIndexes([
        {
          key: { email: 1 },
          unique: true,
          partialFilterExpression: { email: { $type: 'string' } },
        },
      ])
      .catch((error) => {
        // Log but don't fail if indexes already exist
        console.log('Some indexes may already exist:', error.message)
      })

    console.log('MongoDB collections and indexes initialized successfully')
  } catch (error) {
    console.error('Error initializing MongoDB collections:', error)
    // Don't throw error, just log it to prevent app crashes
  }
}
