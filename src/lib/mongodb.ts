import { MongoClient, Db, MongoClientOptions } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  )
}

if (!MONGODB_DB_NAME) {
  throw new Error(
    'Please define the MONGODB_DB_NAME environment variable inside .env'
  )
}

const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  retryReads: true,
  writeConcern: { w: 'majority' },
  // Add DNS resolution fallback
  family: 4, // Use IPv4
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
    client = new MongoClient(MONGODB_URI, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI, options)
  clientPromise = client.connect()
}

export async function getDb(): Promise<Db> {
  try {
    console.log('🔄 Attempting to connect to MongoDB...')
    const connectedClient = await clientPromise
    console.log('✅ Connected to MongoDB successfully')
    const db = connectedClient.db(MONGODB_DB_NAME)
    return db
  } catch (error) {
    console.error('❌ MongoDB connection error in getDb():', error)

    // Check if it's a DNS resolution error
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      console.error(
        '🌐 DNS resolution failed. This might be a network connectivity issue.'
      )
      console.error('💡 Suggestions:')
      console.error('  1. Check your internet connection')
      console.error('  2. Verify MongoDB Atlas cluster is running')
      console.error(
        '  3. Check if your IP address is whitelisted in MongoDB Atlas'
      )
      console.error('  4. Try using a different network or VPN')
    }

    throw new Error('Failed to connect to database')
  }
}

// Export a client promise for seeding and other scripts if needed
export default clientPromise
