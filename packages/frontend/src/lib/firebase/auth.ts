/**
 * Firebase Authentication Helper Functions
 *
 * Provides type-safe wrappers for Firebase Auth operations.
 */

import type { Auth, User, UserCredential } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type Unsubscribe,
} from 'firebase/auth';

/**
 * Sign in with email and password
 */
export async function signInWithEmail(auth: Auth, email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Create a new user with email and password
 */
export async function createUserWithEmail(auth: Auth, email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out current user
 */
export async function signOut(auth: Auth): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  auth: Auth,
  callback: (user: User | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(auth: Auth): User | null {
  return auth.currentUser;
}

/**
 * Get ID token for authenticated user
 */
export async function getIdToken(auth: Auth): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Failed to get ID token:', error);
    return null;
  }
}

/**
 * Force refresh ID token
 */
export async function refreshIdToken(auth: Auth): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    return await user.getIdToken(true);
  } catch (error) {
    console.error('Failed to refresh ID token:', error);
    return null;
  }
}
