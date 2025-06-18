import { initializeCollections } from './mongodb'

// This function can be called manually to initialize the database
export async function initDatabase() {
  try {
    console.log('Initializing database...')
    await initializeCollections()
    console.log('Database initialization completed successfully')
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}

// You can call this function from your app startup or manually
// Example: await initDatabase()
