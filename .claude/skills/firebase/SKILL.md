---
name: firebase
description: Firebase integration patterns for TimeHut PWA. Use when working with Firebase Auth, Firestore, Storage, security rules, emulators, or Firestore operations.
---

# Firebase Integration Patterns

## When to Use

Use this skill when:
- Setting up Firebase configuration
- Implementing authentication (email link, anonymous)
- Working with Firestore CRUD operations
- Creating/reading/updating documents
- Setting up security rules
- Using Firebase emulators
- Implementing real-time updates
- Working with Firestore transactions
- Handling offline support

## Configuration

### Initialize Firebase

**packages/frontend/src/lib/firebase/config.ts:**

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Environment-based config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize once
let app = getApps()[0];
if (!app) {
  app = initializeApp(firebaseConfig);
}

// Export instances
export function getFirebaseApp() {
  return app;
}

export function getAuthInstance() {
  const auth = getAuth(app);
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }
  return auth;
}

export function getFirestoreInstance() {
  const db = getFirestore(app);
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  return db;
}

export function getStorageInstance() {
  const storage = getStorage(app);
  if (!storage) {
    throw new Error('Storage not initialized');
  }
  return storage;
}
```

### Emulator Configuration

**Development mode only:**

```typescript
import { connectAuthEmulator, connectFirestoreEmulator } from 'firebase/app';

// In config file
export function useEmulators() {
  if (import.meta.env.DEV) {
    const auth = getAuth(app);
    connectAuthEmulator(auth, 'http://localhost:9099');

    const db = getFirestore(app);
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
}

// Call during app initialization
useEmulators();
```

## Authentication Patterns

### Email Link Authentication

**Passwordless authentication with magic link:**

```typescript
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getAuthInstance,
} from '@/lib/firebase/config';

// 1. Send magic link
const handleSendLink = async (email: string) => {
  const auth = getAuthInstance();
  const actionCodeSettings = {
    url: window.location.href, // URL to redirect after sign-in
    handleCodeInApp: true,
  };

  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  console.log('Magic link sent to:', email);
};

// 2. Handle email link (when user clicks in email)
const handleEmailLink = async () => {
  const auth = getAuthInstance();

  if (isSignInWithEmailLink(auth, window.location.href)) {
    await signInWithEmailLink(auth, window.location.href);
    console.log('Signed in successfully');

    // Redirect to app
    window.location.href = '/timeline';
  }
};

// 3. Listen to auth state changes
useEffect(() => {
  const auth = getAuthInstance();
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user);
    // Update state
  });

  return () => unsubscribe();
}, []);
```

### Anonymous Authentication

**For local testing:**

```typescript
import { signInAnonymously } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase/config';

const handleTestAccount = async () => {
  const auth = getAuthInstance();

  try {
    const user = await signInAnonymously(auth);
    console.log('Test user signed in:', user);
  } catch (error) {
    console.error('Failed to sign in test user:', error);
  }
};
```

### Get ID Token

**For API authentication:**

```typescript
import { getIdToken } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase/config';

const getIdToken = async (): Promise<string> => {
  const auth = getAuthInstance();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No authenticated user');
  }

  const token = await user.getIdToken();
  return token;
};

// Usage
const token = await getIdToken();
const headers = { 'Authorization': `Bearer ${token}` };
```

### Sign Out

```typescript
import { signOut as firebaseSignOut } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase/config';

const handleSignOut = async () => {
  const auth = getAuthInstance();

  await firebaseSignOut(auth);
  console.log('User signed out');

  // Clear local state
  localStorage.removeItem('current_family_id');
};
```

## Firestore Operations

### Document Structure

**Collection paths:**

```
families/{familyId}
  ├─ babies/{babyId}
  ├─ moments/{momentId}
  ├─ capsules/{capsuleId}
  └─ settings
```

### TypeScript Types

**packages/frontend/src/types/firestore.ts:**

```typescript
export interface FamilyDocument {
  id: string;
  name: string;
  createdAt: string;
  members: Record<string, FamilyMember>;
  settings: FamilySettings;
}

export interface FamilyMember {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: string;
}

export interface BabyDocument {
  id: string;
  name: string;
  dob: string;
  gender: 'male' | 'female';
  createdAt: string;
}

export interface MomentDocument {
  id: string;
  babyId: string;
  dateTaken: string;
  mediaType: 'photo' | 'video';
  objectKey: string;
  caption?: string;
  createdAt: string;
}

export interface CapsuleDocument {
  id: string;
  familyId: string;
  babyId?: string;
  title: string;
  message?: string;
  mediaKeys: string[];
  unlockDate: string;
  createdBy: string;
  createdAt: string;
  status: 'locked' | 'unlocked';
}
```

### Create Document

```typescript
import {
  collection,
  doc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase/config';

async function createBaby(
  familyId: string,
  baby: Omit<BabyDocument, 'id' | 'createdAt'>
): Promise<string> {
  const db = getFirestoreInstance();

  // Reference: families/{familyId}/babies/{babyId}
  const babyRef = doc(collection(db, 'families', familyId), 'babies', baby.id);

  await setDoc(babyRef, {
    ...baby,
    createdAt: serverTimestamp(),
  });

  return baby.id;
}

// Usage
const babyId = await createBaby(familyId, {
  id: `baby-${Date.now()}`,
  name: 'Baby Name',
  dob: '2025-01-01T00:00:00Z',
  gender: 'male',
});
```

### Read Document

```typescript
import { doc, getDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase/config';

async function getBaby(
  familyId: string,
  babyId: string
): Promise<BabyDocument | null> {
  const db = getFirestoreInstance();

  const babyRef = doc(db, 'families', familyId, 'babies', babyId);
  const snapshot = await getDoc(babyRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as BabyDocument;
}

// Usage
const baby = await getBaby(familyId, babyId);
if (baby) {
  console.log('Baby:', baby.name);
}
```

### Update Document

```typescript
import { doc, updateDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase/config';

async function updateBaby(
  familyId: string,
  babyId: string,
  updates: Partial<Omit<BabyDocument, 'id' | 'createdAt'>>
): Promise<void> {
  const db = getFirestoreInstance();

  const babyRef = doc(db, 'families', familyId, 'babies', babyId);
  await updateDoc(babyRef, updates);
}

// Usage
await updateBaby(familyId, babyId, {
  name: 'Updated Name',
});
```

### Delete Document

```typescript
import { doc, deleteDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase/config';

async function deleteMoment(
  familyId: string,
  babyId: string,
  momentId: string
): Promise<void> {
  const db = getFirestoreInstance();

  const momentRef = doc(db, 'families', familyId, 'babies', babyId, 'moments', momentId);
  await deleteDoc(momentRef);
}

// Usage
await deleteMoment(familyId, babyId, momentId);
```

### Query Collection

```typescript
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase/config';

async function getRecentMoments(
  familyId: string,
  babyId: string,
  count: number = 20
): Promise<MomentDocument[]> {
  const db = getFirestoreInstance();

  const momentsRef = collection(db, 'families', familyId, 'babies', babyId, 'moments');

  const q = query(
    momentsRef,
    orderBy('dateTaken', 'desc'),
    limit(count)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => doc.data() as MomentDocument);
}

// Usage
const moments = await getRecentMoments(familyId, babyId, 20);
```

### Pagination

```typescript
async function getPaginatedMoments(
  familyId: string,
  babyId: string,
  lastMomentId?: string
): Promise<{ moments: MomentDocument[]; nextCursor?: string }> {
  const db = getFirestoreInstance();

  const momentsRef = collection(db, 'families', familyId, 'babies', babyId, 'moments');

  let q = query(momentsRef, orderBy('dateTaken', 'desc'), limit(21));

  // Start after last document
  if (lastMomentId) {
    const lastRef = doc(momentsRef, lastMomentId);
    q = query(momentsRef, orderBy('dateTaken', 'desc'), startAfter(lastRef), limit(20));
  }

  const snapshot = await getDocs(q);
  const moments = snapshot.docs.map(doc => doc.data() as MomentDocument);

  // Return cursor for next page
  const nextCursor = snapshot.docs.length > 20 ? moments[19].id : undefined;

  return { moments, nextCursor };
}
```

### Real-time Updates

```typescript
import { onSnapshot, doc } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase/config';

const useRealtimeMoment = (familyId: string, babyId: string, momentId: string) => {
  const [moment, setMoment] = useState<MomentDocument | null>(null);

  useEffect(() => {
    const db = getFirestoreInstance();
    const momentRef = doc(db, 'families', familyId, 'babies', babyId, 'moments', momentId);

    const unsubscribe = onSnapshot(momentRef, (snapshot) => {
      if (snapshot.exists()) {
        setMoment(snapshot.data() as MomentDocument);
      }
    });

    return () => unsubscribe();
  }, [familyId, babyId, momentId]);

  return moment;
};

// Usage in component
const moment = useRealtimeMoment(familyId, babyId, momentId);
return <div>{moment?.caption}</div>;
```

### Transactions

```typescript
import {
  runTransaction,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase/config';

async function transferMomentOwnership(
  familyId: string,
  babyId: string,
  momentId: string,
  newOwnerUid: string
): Promise<void> {
  const db = getFirestoreInstance();
  const momentRef = doc(db, 'families', familyId, 'babies', babyId, 'moments', momentId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(momentRef);

    if (!snapshot.exists()) {
      throw new Error('Moment not found');
    }

    const moment = snapshot.data() as MomentDocument;

    // Verify current owner
    if (moment.babyId !== babyId) {
      throw new Error('Not authorized to transfer this moment');
    }

    // Update owner
    transaction.update(momentRef, {
      babyId: newOwnerUid, // Transfer to new owner
    });
  });
}
```

## Security Rules

### Family-Based Access

**firestore.rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Families collection
    match /families/{familyId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid in resource.data.members;

      // Subcollections
      match /babies/{babyId} {
        allow read: if request.auth != null;
        allow write: if request.auth.uid in resource.data.members;
      }

      match /moments/{momentId} {
        allow read: if request.auth != null;
        allow write: if request.auth.uid in resource.data.members;
      }

      match /capsules/{capsuleId} {
        allow read: if request.auth.uid in resource.data.members;
        allow write: if request.auth.uid in resource.data.members;
      }
    }
  }
}
```

### Role-Based Access

```javascript
match /families/{familyId} {
  // Admins can write family settings
  allow write: if request.auth != null &&
    request.auth.uid in resource.data.members &&
    resource.data.members[request.auth.uid].role == 'admin';

  // Editors can read/write family data (except members)
  allow read: if request.auth != null &&
    request.auth.uid in resource.data.members &&
    resource.data.members[request.auth.uid].role in ['admin', 'editor'];

  // Viewers can only read
  allow read: if request.auth != null &&
    request.auth.uid in resource.data.members;
}
```

### Data Validation

```javascript
match /families/{familyId}/babies/{babyId} {
  allow create: if request.auth != null &&
    request.auth.uid in resource.data.members &&
    // Validate required fields
    request.resource.data.name is string &&
    request.resource.data.name.size() > 0 &&
    request.resource.data.dob is string &&
    request.resource.data.gender in ['male', 'female'];
}
```

## Offline Support

### Enable Offline Persistence

```typescript
import { initializeFirestore, enableMultiTabIndexedDbPersistence, enableIndexedDbPersistence } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase/config';

export function initFirestoreOffline() {
  const db = getFirestoreInstance();

  if (import.meta.env.DEV) {
    // Development: use IndexedDB
    enableIndexedDbPersistence(db)
      .then(() => console.log('IndexedDB persistence enabled'))
      .catch(err => console.error('Failed to enable persistence:', err));
  } else {
    // Production: use multi-tab IndexedDB
    enableMultiTabIndexedDbPersistence(db)
      .then(() => console.log('Multi-tab IndexedDB persistence enabled'))
      .catch(err => console.error('Failed to enable persistence:', err));
  }
}

// Call during app initialization
initFirestoreOffline();
```

### Check Connection Status

```typescript
import { getFirestoreInstance } from '@/lib/firebase/config';

const useFirestoreConnection = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const db = getFirestoreInstance();

    const unsubscribe = db.onSnapshotsInSync((meta) => {
      // meta.pendingLeaves: Changes waiting to be sent
      // meta.fromCache: Data from cache
      // meta.hasPendingWrites: Local writes pending
      setIsConnected(!meta.fromCache);
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
};

// Usage in component
const isConnected = useFirestoreConnection();
return (
  <div>
    {isConnected ? <OnlineIndicator /> : <OfflineIndicator />}
  </div>
);
```

## Error Handling

### Common Errors

```typescript
import { FirebaseError } from 'firebase/app';

function handleFirebaseError(error: FirebaseError): string {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'This email is already in use.';
    case 'auth/weak-password':
      return 'Password is too weak.';
    case 'firestore/permission-denied':
      return 'You do not have permission to perform this action.';
    case 'firestore/not-found':
      return 'Document not found.';
    case 'firestore/already-exists':
      return 'Document already exists.';
    case 'firestore/unavailable':
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return error.message || 'An unknown error occurred.';
  }
}

// Usage
try {
  await createBaby(familyId, baby);
} catch (error: any) {
  const errorMessage = handleFirebaseError(error);
  setError(errorMessage);
}
```

### Retry Logic

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      // Don't retry if it's not a retryable error
      if (error?.code?.includes('permission-denied') ||
          error?.code?.includes('not-found')) {
        throw error;
      }

      // Wait before retry
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw new Error('Max retries exceeded');
}

// Usage
const baby = await withRetry(() => getBaby(familyId, babyId));
```

## Emulators

### Start Emulators

```bash
cd firebase
firebase emulators:start
```

**Services:**
- Auth: http://localhost:9099
- Firestore: http://localhost:8080
- UI: http://localhost:4000
- Storage: http://localhost:9199

### Connect to Emulators

**In config file:**

```typescript
import { connectAuthEmulator, connectFirestoreEmulator } from 'firebase/app';

export function connectToEmulators() {
  if (import.meta.env.DEV) {
    // Connect to Auth emulator
    const auth = getAuth(app);
    connectAuthEmulator(auth, 'http://localhost:9099');

    // Connect to Firestore emulator
    const db = getFirestore(app);
    connectFirestoreEmulator(db, 'localhost', 8080);

    console.log('Connected to Firebase emulators');
  }
}
```

### Clear Emulator Data

```bash
# Stop emulators
# Add --clear flag to clear all data
firebase emulators:start --clear
```

## Anti-Patterns to Avoid

### ❌ Skipping Authentication Check

```typescript
// ❌ WRONG - no auth check
async function createBaby(familyId, baby) {
  await addDoc(collection(db, 'families', familyId, 'babies'), baby);
}

// ✅ RIGHT - verify user is member
async function createBaby(familyId, baby) {
  const auth = getAuthInstance();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Verify user is member of family
  const family = await getFamily(familyId);
  if (!family.members[user.uid]) {
    throw new Error('Not a member of this family');
  }

  await addDoc(collection(db, 'families', familyId, 'babies'), baby);
}
```

### ❌ Using Client Timestamps

```typescript
// ❌ WRONG - uses local time
await addDoc(ref, {
  createdAt: new Date().toISOString(),
});

// ✅ RIGHT - uses server timestamp
await addDoc(ref, {
  createdAt: serverTimestamp(),
});
```

### ❌ Not Handling Errors

```typescript
// ❌ WRONG - no error handling
await updateDoc(ref, updates);

// ✅ RIGHT - handle errors
try {
  await updateDoc(ref, updates);
} catch (error: FirebaseError) {
  console.error('Failed to update:', error);
  throw new Error('Failed to update document');
}
```

### ❌ Ignoring Offline State

```typescript
// ❌ WRONG - doesn't check connection
const fetchMoments = async () => {
  return await getDocs(query(ref));
};

// ✅ RIGHT - check connection
const fetchMoments = async () => {
  if (!isConnected) {
    return getCachedMoments();
  }
  return await getDocs(query(ref));
};
```

## Key Patterns Summary

### ✅ DO:
- Use `serverTimestamp()` for all `createdAt` fields
- Validate authentication before Firestore operations
- Check family membership before allowing access
- Use role-based access control in security rules
- Enable offline persistence in production
- Handle Firebase errors with user-friendly messages
- Use transactions for complex updates
- Listen to auth state changes
- Use real-time updates with `onSnapshot`
- Connect to emulators in development
- Retry on retryable errors

### ❌ DON'T:
- Skip authentication checks
- Use client timestamps instead of server timestamps
- Ignore errors from Firestore operations
- Allow writes without permission checks
- Forget to handle offline state
- Use client-generated IDs (use auto-generated IDs)
- Mix Firestore with other databases

## Related Skills

- `react-typescript` - React/TypeScript patterns
- `pwa-specific` - Domain-specific patterns (age calc, media upload)
- `testing` - Testing patterns for Firebase
