# MongoDB to Firebase Migration Guide

## Collection Mapping

### Users Collection

```typescript
// MongoDB Structure
interface MongoUser {
  _id: ObjectId
  email: string
  name: string
  photoUrl: string | null
  // ... other user fields
}

// Firebase Structure
interface FirebaseUser {
  uid: string // From Firebase Auth
  email: string // From Firebase Auth
  displayName: string // From Firebase Auth
  photoURL: string // From Firebase Auth
  // Custom claims and additional data in Firestore
}
```

### Messages Collection

```typescript
// MongoDB
{
  roomId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
}

// Firebase Realtime Database
messages/{roomId}/{messageId} = {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number; // Firebase server timestamp
}
```

## Migration Steps

1. User Authentication:

   - Export user data from MongoDB
   - Import users into Firebase Authentication
   - Store additional user data in Firestore

2. Chat Messages:

   - Export messages from MongoDB
   - Import into Firebase Realtime Database
   - Update chat components to use Firebase RTDB listeners

3. Photos and Stories:
   - Move media files to Firebase Storage
   - Store metadata in Firestore

## Firebase Security Rules

### Realtime Database

```json
{
  "rules": {
    "messages": {
      "$roomId": {
        ".read": "auth != null && (data.child('senderId').val() === auth.uid || data.child('receiverId').val() === auth.uid)",
        ".write": "auth != null && (!data.exists() || data.child('senderId').val() === auth.uid)"
      }
    }
  }
}
```

### Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    // Add more collection rules as needed
  }
}
```

## Environment Variables Migration

```plaintext
# Old MongoDB Variables
MONGODB_URI=your_mongodb_uri
MONGODB_DB_NAME=your_db_name

# New Firebase Variables
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
```

## Code Migration Examples

### User Authentication

```typescript
// Old MongoDB auth
const user = await db.collection('users').findOne({ email })

// New Firebase auth
import { signInWithEmailAndPassword } from 'firebase/auth'
const userCredential = await signInWithEmailAndPassword(auth, email, password)
```

### Real-time Messages

```typescript
// Old MongoDB/Pusher
pusherServer.trigger(`room-${roomId}`, 'message', message)

// New Firebase RTDB
import { ref, push, onValue } from 'firebase/database'
const messagesRef = ref(realtimeDb, `messages/${roomId}`)
push(messagesRef, message)
onValue(messagesRef, (snapshot) => {
  const messages = snapshot.val()
  // Handle messages
})
```
