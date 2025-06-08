
// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
import { MongoClient, ServerApiVersion, Db } from 'mongodb';
import { config } from 'dotenv'
config() // Load environment variables from .env file

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "TrekConnect"; // Default DB name if not in URI or env

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Define a type for the global object to safely attach the MongoDB client promise
interface GlobalWithMongo extends globalThis.Window {
  _mongoClientPromise?: Promise<MongoClient>;
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = globalThis as unknown as GlobalWithMongo;
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

export async function getDb(): Promise<Db> {
  const mongoClient = await clientPromise;
  return mongoClient.db(dbName);
}
