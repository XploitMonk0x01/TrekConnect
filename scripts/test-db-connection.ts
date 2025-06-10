import clientPromise from '../src/lib/mongodb'

async function testConnection() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB_NAME)

    // Perform a simple operation to verify connectivity
    const collections = await db.listCollections().toArray()
    console.log('Successfully connected to MongoDB!')
    console.log('Database:', process.env.MONGODB_DB_NAME)
    console.log(
      'Available collections:',
      collections.map((c) => c.name)
    )

    // Don't close the connection since it's managed by clientPromise
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    process.exit(1)
  }
}

void testConnection()
