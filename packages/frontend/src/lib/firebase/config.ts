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

/**
 * Check if localStorage is available and working
 */
function checkLocalStorageAvailability(): boolean {
  try {
    const testKey = '__firebase_auth_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    console.log('[Firebase] localStorage is available and working');

    // Log what's currently in localStorage
    logLocalStorageContents();

    return true;
  } catch (error) {
    console.error('[Firebase] ❌ localStorage is NOT available:', error);
    console.warn('[Firebase] This will cause auth to fail on refresh!');
    return false;
  }
}

/**
 * Log localStorage contents for debugging
 */
function logLocalStorageContents(): void {
  console.log('[Firebase] Current localStorage contents:');
  const allKeys = Object.keys(localStorage);
  const firebaseKeys = allKeys.filter(k =>
    k.toLowerCase().includes('firebase') ||
    k.toLowerCase().includes('auth')
  );

  if (firebaseKeys.length > 0) {
    console.log('[Firebase]   Found', firebaseKeys.length, 'Firebase-related keys:');
    firebaseKeys.forEach(key => {
      const value = localStorage.getItem(key);
      const preview = value ? value.substring(0, 50) + '...' : '(empty)';
      console.log('[Firebase]     -', key, ':', preview);
    });
  } else {
    console.log('[Firebase]   No Firebase keys found (this is expected on fresh load)');
  }

  // Check for our custom keys
  const currentFamilyId = localStorage.getItem('timehut_current_family_id');
  console.log('[Firebase]   Current family ID:', currentFamilyId || 'None');
}

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
export async function getAuthInstance(): Promise<Auth> {
  const firebaseApp = getFirebaseApp();

  if (!authInstance) {
    console.log('[Firebase] Creating new auth instance...');

    // Check localStorage availability first
    const localStorageAvailable = checkLocalStorageAvailability();

    authInstance = getAuth(firebaseApp);

    // Configure persistence - MUST be set before any other auth operations
    if (localStorageAvailable) {
      try {
        console.log('[Firebase] Setting auth persistence to browserLocalPersistence...');
        await setPersistence(authInstance, browserLocalPersistence);
        console.log('[Firebase] ✅ Auth persistence successfully set to browserLocalPersistence');
      } catch (error: any) {
        console.error('[Firebase] ❌ Failed to set auth persistence:', error);
        console.error('[Firebase] Error details:', {
          code: error?.code,
          message: error?.message,
          name: error?.name
        });
        // Don't throw - allow app to continue without persistence
        // This is better than crashing the app
        console.warn('[Firebase] ⚠️  Continuing without persistence - user will be logged out on refresh');
      }
    } else {
      console.warn('[Firebase] ⚠️  localStorage not available - auth cannot persist');
    }

    // Connect to emulator if enabled
    if (USE_EMULATORS) {
      const authEmulatorUrl = import.meta.env.VITE_FIREBASE_EMULATOR_HOST
        ? `http://${import.meta.env.VITE_FIREBASE_EMULATOR_HOST}`
        : 'http://localhost:9099';
      connectAuthEmulator(authInstance, authEmulatorUrl);
      console.log(`[Firebase] Connected to Auth emulator at ${authEmulatorUrl}`);
    }

    // Verify persistence setting
    try {
      const persistenceType = authInstance.persistence;
      console.log('[Firebase] Current persistence type:', persistenceType);
    } catch (err) {
      console.warn('[Firebase] Could not verify persistence type:', err);
    }
  } else {
    console.log('[Firebase] Reusing existing auth instance');
    // Log localStorage contents to see what we have on refresh
    logLocalStorageContents();
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
