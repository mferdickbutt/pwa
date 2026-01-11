/**
 * Firebase Authentication Helper Functions
 *
 * Supports email/password authentication.
 */

import {
  Auth,
  User,
  UserCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  Unsubscribe,
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
 * Get current user
 */
export function getCurrentUser(auth: Auth): User | null {
  return auth.currentUser;
}

/**
 * Get ID token for API requests
 */
export async function getIdToken(auth: Auth): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const idToken = await user.getIdToken();
    return idToken;
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
    const idToken = await user.getIdToken(true);
    return idToken;
  } catch (error) {
    console.error('Failed to refresh ID token:', error);
    return null;
  }
}
