/**
 * Firebase Configuration
 *
 * Handles Firebase initialization with emulator support for local development
 * and production configuration for deployment.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  Auth,
  inMemoryPersistence,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
  enableMultiTabIndexedDbPersistence,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';

// Configuration from environment variables
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'localhost:9099',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'timehut-local',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'timehut-local.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Use emulators flag
const USE_EMULATORS = import.meta.env.VITE_USE_EMULATORS === 'true';

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

/**
 * Initialize Firebase app
 */
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
  }
  return app;
}

/**
 * Get or create Auth instance
 */
export function getAuthInstance(): Auth {
  const firebaseApp = getFirebaseApp();

  if (!authInstance) {
    authInstance = getAuth(firebaseApp);

    // Configure persistence
    if (USE_EMULATORS) {
      // Use in-memory persistence for emulator testing
      setPersistence(authInstance, inMemoryPersistence);
    } else {
      // Use local persistence for production
      setPersistence(authInstance, browserLocalPersistence).catch((error) => {
        console.error('Failed to set auth persistence:', error);
      });
    }

    // Connect to emulator if enabled
    if (USE_EMULATORS) {
      const authEmulatorUrl = import.meta.env.VITE_FIREBASE_EMULATOR_HOST
        ? `http://${import.meta.env.VITE_FIREBASE_EMULATOR_HOST}`
        : 'http://localhost:9099';
      connectAuthEmulator(authInstance, authEmulatorUrl);
      console.log(`[Firebase] Connected to Auth emulator at ${authEmulatorUrl}`);
    }
  }

  return authInstance;
}

/**
 * Get or create Firestore instance with offline persistence
 */
export async function getFirestoreInstance(): Promise<Firestore> {
  const firebaseApp = getFirebaseApp();

  if (!firestoreInstance) {
    // Initialize with specific settings for better offline support
    firestoreInstance = initializeFirestore(firebaseApp, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    });

    // Connect to emulator if enabled
    if (USE_EMULATORS) {
      const firestoreEmulatorHost = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || 'localhost:8080';
      const [host, port] = firestoreEmulatorHost.split(':');
      connectFirestoreEmulator(firestoreInstance, host, parseInt(port, 10));
      console.log(`[Firebase] Connected to Firestore emulator at ${firestoreEmulatorHost}`);
    } else {
      // Enable offline persistence for production
      try {
        await enableMultiTabIndexedDbPersistence(firestoreInstance);
        console.log('[Firebase] Firestore offline persistence enabled');
      } catch (error: any) {
        if (error.code === 'failed-precondition') {
          console.warn(
            '[Firebase] Multiple tabs open, persistence can only be enabled in one tab at a time.'
          );
        } else if (error.code === 'unimplemented') {
          console.warn('[Firebase] Persistence not supported by this browser.');
        } else {
          console.error('[Firebase] Failed to enable persistence:', error);
        }
      }
    }
  }

  return firestoreInstance;
}

// Export convenience functions
export { getAuth, getFirestore };
export type { Firestore };
