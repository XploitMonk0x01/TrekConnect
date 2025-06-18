const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env' })

async function testConnection() {
  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB_NAME

  console.log('Testing MongoDB connection...')
  console.log('URI:', uri)
  console.log('Database:', dbName)

  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables')
    return
  }

  if (!dbName) {
    console.error('❌ MONGODB_DB_NAME not found in environment variables')
    return
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  })

  try {
    await client.connect()
    console.log('✅ Successfully connected to MongoDB')

    const db = client.db(dbName)
    const collections = await db.listCollections().toArray()
    console.log(
      '📁 Collections:',
      collections.map((c) => c.name)
    )

    // Test users collection
    const usersCollection = db.collection('users')
    const userCount = await usersCollection.countDocuments()
    console.log('👥 Users count:', userCount)
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await client.close()
  }
}

testConnection()
