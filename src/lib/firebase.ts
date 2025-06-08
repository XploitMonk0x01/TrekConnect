
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged } from 'firebase/auth';
import { upsertUserFromFirebase, getUserProfile } from '@/services/users';
import { getStorage, FirebaseStorage } from 'firebase/storage';
// import { getFirestore } from 'firebase/firestore';
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let auth: Auth;
let storage: FirebaseStorage; // Declare storage variable
// let firestore: Firestore;
// let analytics: Analytics;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
storage = getStorage(app); // Initialize storage
// firestore = getFirestore(app);
// if (typeof window !== 'undefined') {
//   analytics = getAnalytics(app);
// }

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    console.log('[TrekConnect Debug] Auth state changed: User signed in.', user.uid);
    // Check if user already exists in MongoDB to avoid unnecessary upsert calls on every auth state change
    const userProfile = await getUserProfile(user.uid);
    if (!userProfile) {
      await upsertUserFromFirebase(user);
    }
  }
});

export { app, auth, storage };
