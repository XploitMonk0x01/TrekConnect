import { MongoClient, MongoClientOptions } from 'mongodb'
import { config } from 'dotenv'

config()

// Ensure environment variables are set
if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
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
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client
      .connect()
      .then((client) => {
        console.log('Connected to MongoDB in development mode')
        return client
      })
      .catch((error) => {
        console.error('Failed to connect to MongoDB:', error)
        throw error
      })
  }
  mongoClientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  mongoClientPromise = client
    .connect()
    .then((client) => {
      console.log('Connected to MongoDB in production mode')
      return client
    })
    .catch((error) => {
      console.error('Failed to connect to MongoDB:', error)
      throw error
    })
}

clientPromise = mongoClientPromise

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
