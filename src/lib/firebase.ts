
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
// Auth related imports removed: getAuth, Auth, onAuthStateChanged
// Service imports for user sync removed: upsertUserFromFirebase, getUserProfile
import { getStorage, FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

let app: FirebaseApp
// Auth variable removed
let storage: FirebaseStorage

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Auth initialization removed
storage = getStorage(app)

// onAuthStateChanged listener and related user synchronization logic removed.
// The application will now rely on a custom MongoDB-based authentication system.

export { app, storage }
