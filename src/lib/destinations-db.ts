
import { MongoClient, MongoClientOptions, Db } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env')
}

const uri = process.env.MONGODB_URI
const options: MongoClientOptions = {
  maxPoolSize: 5,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export async function getDestinationsDb(): Promise<Db> {
  try {
    const connectedClient = await clientPromise
    const dbName = process.env.MONGODB_DB_NAME || 'TrekConnect'
    return connectedClient.db(dbName)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw new Error('Failed to connect to destinations database')
  }
}
