/**
 * Firebase Authentication Helper Functions
 *
 * Note: Using email link (passwordless) authentication as per user preference.
 */

import {
  Auth,
  User,
  UserCredential,
  signInAnonymously,
  signOut as firebaseSignOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
  Unsubscribe,
} from 'firebase/auth';

// Action code settings for email link authentication
const ACTION_CODE_SETTINGS = {
  // URL must be whitelisted in Firebase Console
  url: import.meta.env.VITE_APP_URL || window.location.origin,
  handleCodeInApp: true,
  // When multiple accounts share email, iOS will prompt to choose
  iOS: {
    bundleId: 'com.timehut.app',
  },
  android: {
    packageName: 'com.timehut.app',
    installApp: true,
  },
};

/**
 * Send sign-in link to email
 */
export async function sendEmailLink(auth: Auth, email: string): Promise<void> {
  await sendSignInLinkToEmail(auth, email, ACTION_CODE_SETTINGS);

  // Save email to localStorage for verification completion
  window.localStorage.setItem('timehut_email_for_signin', email);
}

/**
 * Complete sign-in with email link
 * Call this when the app opens with an email link (check URL for ?apiKey=...)
 */
export async function completeEmailLinkSignIn(auth: Auth): Promise<UserCredential | null> {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('timehut_email_for_signin');

    if (!email) {
      // If email not stored, prompt user
      email = window.prompt('Please provide your email for confirmation') || '';
    }

    if (!email) {
      throw new Error('Email is required to complete sign-in');
    }

    const result = await signInWithEmailLink(auth, email, window.location.href);

    // Clear email from storage
    window.localStorage.removeItem('timehut_email_for_signin');

    return result;
  }

  return null;
}

/**
 * Sign in anonymously (for testing with emulator)
 */
export async function signInAnonymouslyForTesting(auth: Auth): Promise<UserCredential> {
  return signInAnonymously(auth);
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
