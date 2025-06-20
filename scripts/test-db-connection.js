const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env' })

async function testAppConnection() {
  console.log('=== Testing App Database Connection ===')

  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB_NAME

  console.log('URI:', uri ? '✅ Set' : '❌ Not set')
  console.log('Database Name:', dbName || '❌ Not set')

  if (!uri || !dbName) {
    console.error('❌ Missing required environment variables')
    return
  }

  const options = {
    maxPoolSize: 10,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    retryWrites: true,
    retryReads: true,
    writeConcern: { w: 'majority' },
    heartbeatFrequencyMS: 10000,
  }

  const client = new MongoClient(uri, options)

  try {
    console.log('\n🔌 Connecting to MongoDB...')
    await client.connect()
    console.log('✅ Connected to MongoDB')

    console.log(`\n📁 Accessing database: ${dbName}`)
    const db = client.db(dbName)

    console.log('📋 Listing collections...')
    const collections = await db.listCollections().toArray()
    console.log(
      'Collections:',
      collections.map((c) => c.name)
    )

    console.log('\n👥 Testing users collection...')
    const usersCollection = db.collection('users')
    const userCount = await usersCollection.countDocuments()
    console.log(`Users count: ${userCount}`)

    if (userCount > 0) {
      console.log('\n📝 Sample user:')
      const sampleUser = await usersCollection.findOne(
        {},
        { projection: { email: 1, name: 1, _id: 0 } }
      )
      console.log(sampleUser)
    }

    console.log('\n✅ All tests passed! Your database connection is working.')
  } catch (error) {
    console.error('\n❌ Database connection failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await client.close()
  }
}

testAppConnection()
