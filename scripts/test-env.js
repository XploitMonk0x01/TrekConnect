require('dotenv').config({ path: '.env' })

console.log('=== Environment Variables Test ===')
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set')
console.log('MONGODB_DB_NAME:', process.env.MONGODB_DB_NAME || '❌ Not set')
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set')
console.log('NODE_ENV:', process.env.NODE_ENV || '❌ Not set')

if (!process.env.MONGODB_URI) {
  console.error('\n❌ MONGODB_URI is missing from .env file')
  process.exit(1)
}

if (!process.env.MONGODB_DB_NAME) {
  console.error('\n❌ MONGODB_DB_NAME is missing from .env file')
  process.exit(1)
}

console.log('\n✅ All required environment variables are set!')
