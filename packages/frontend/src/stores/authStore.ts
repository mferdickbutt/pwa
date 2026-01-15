/**
 * Authentication Store
 *
 * Manages authentication state using Zustand.
 * Integrates with Firebase Auth for email/password authentication.
 */

import { create } from 'zustand';
import {
  getAuthInstance,
  getFirestoreInstance,
} from '../lib/firebase/config';
import {
  onAuthStateChange,
  signOut as firebaseSignOut,
  getCurrentUser,
} from '../lib/firebase/auth';
import type { User } from 'firebase/auth';
import type { FamilyDocument, BabyDocument } from '../types/firestore';
import {
  getFamily,
  getUserFamilies,
  getBabies,
  updateBaby,
  createFamily as createFamilyDoc,
  createBaby as createBabyDoc,
} from '../lib/firebase/firestore';

const CURRENT_FAMILY_ID_KEY = 'timehut_current_family_id';

/**
 * Authentication state
 */
interface AuthState {
  // User state
  user: User | null;
  uid: string | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Family state
  families: FamilyDocument[];
  currentFamily: FamilyDocument | null;
  currentFamilyId: string | null;

  // Babies state
  babies: BabyDocument[];

  // Actions
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  createFamily: (name: string) => Promise<string>;
  setCurrentFamily: (familyId: string) => Promise<void>;
  reloadFamilies: () => Promise<void>;
  reloadBabies: () => Promise<void>;
  createBaby: (name: string, dob: string, gender: 'male' | 'female') => Promise<string>;
  updateBaby: (babyId: string, updates: Partial<Omit<BabyDocument, 'createdAt' | 'id'>>) => Promise<void>;
  reset: () => void;
}

/**
 * Create the auth store
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  uid: null,
  isLoading: true,
  isInitialized: false,
  families: [],
  currentFamily: null,
  currentFamilyId: null,
  babies: [],

  /**
   * Initialize authentication
   */
  initialize: async () => {
    console.log('[AuthStore] Initializing auth store...');
    try {
      const auth = await getAuthInstance();
      console.log('[AuthStore] Got auth instance, setting up state listener...');

      onAuthStateChange(auth, async (user) => {
        console.log('[AuthStore] Auth state changed:');
        console.log('[AuthStore]   User:', user ? `✅ ${user.email} (${user.uid})` : '❌ Null');

        if (user) {
          console.log('[AuthStore]   User metadata:');
          console.log('[AuthStore]     Created:', new Date(user.metadata.creationTime).toISOString());
          console.log('[AuthStore]     Last sign-in:', new Date(user.metadata.lastSignInTime).toISOString());
          console.log('[AuthStore]     Email verified:', user.emailVerified);
          console.log('[AuthStore]     Provider:', user.providerData[0]?.providerId);
        }

        set({
          user,
          uid: user?.uid || null,
          isLoading: false,
          isInitialized: true,
        });

        if (user) {
          console.log('[AuthStore] User authenticated, loading families...');
          await get().reloadFamilies();

          const savedFamilyId = localStorage.getItem(CURRENT_FAMILY_ID_KEY);
          const familyId = savedFamilyId || get().families[0]?.id;
          console.log('[AuthStore] Selected family:', familyId);
          if (familyId) {
            await get().setCurrentFamily(familyId);
          }
        } else {
          console.log('[AuthStore] User not authenticated, clearing data...');
          set({
            families: [],
            currentFamily: null,
            currentFamilyId: null,
            babies: [],
          });
        }
      });

      console.log('[AuthStore] Auth state listener set up');
    } catch (error) {
      console.error('[AuthStore] Failed to initialize:', error);
      set({
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  /**
   * Sign out
   */
  signOut: async () => {
    const auth = await getAuthInstance();
    await firebaseSignOut(auth);
    localStorage.removeItem(CURRENT_FAMILY_ID_KEY);
    set({
      user: null,
      uid: null,
      families: [],
      currentFamily: null,
      currentFamilyId: null,
      babies: [],
    });
  },

  /**
   * Create a new family
   */
  createFamily: async (name: string) => {
    const { uid } = get();
    if (!uid) {
      throw new Error('Not authenticated');
    }

    const db = await getFirestoreInstance();
    const familyId = await createFamilyDoc(db, name.trim(), uid);

    await get().reloadFamilies();
    await get().setCurrentFamily(familyId);

    return familyId;
  },

  /**
   * Set current family
   */
  setCurrentFamily: async (familyId: string) => {
    const auth = await getAuthInstance();
    const user = getCurrentUser(auth);

    if (!user) {
      console.warn('[Auth] Cannot set family: not authenticated');
      return;
    }

    const db = await getFirestoreInstance();
    const family = await getFamily(db, familyId);

    if (!family) {
      console.error(`[Auth] Family ${familyId} not found`);
      return;
    }

    if (!family.members[user.uid]) {
      console.error(`[Auth] User is not a member of family ${familyId}`);
      return;
    }

    set({
      currentFamily: family,
      currentFamilyId: familyId,
    });

    localStorage.setItem(CURRENT_FAMILY_ID_KEY, familyId);
    await get().reloadBabies();
  },

  /**
   * Reload all families for current user
   */
  reloadFamilies: async () => {
    const { uid } = get();
    if (!uid) return;

    const db = await getFirestoreInstance();
    const families = await getUserFamilies(db, uid);
    set({ families });
  },

  /**
   * Reload babies for current family
   */
  reloadBabies: async () => {
    const { currentFamilyId } = get();
    if (!currentFamilyId) return;

    const db = await getFirestoreInstance();
    const babies = await getBabies(db, currentFamilyId);
    set({ babies });
  },

  /**
   * Create a new baby
   */
  createBaby: async (name: string, dob: string, gender: 'male' | 'female') => {
    const { currentFamilyId } = get();
    if (!currentFamilyId) {
      throw new Error('No family selected');
    }

    const db = await getFirestoreInstance();
    const babyId = await createBabyDoc(db, currentFamilyId, {
      name: name.trim(),
      dob,
      gender,
    });

    await get().reloadBabies();
    return babyId;
  },

  /**
   * Update baby profile
   */
  updateBaby: async (babyId, updates) => {
    const { currentFamilyId } = get();
    if (!currentFamilyId) {
      throw new Error('No family selected');
    }

    const db = await getFirestoreInstance();
    await updateBaby(db, currentFamilyId, babyId, updates);

    set({
      babies: get().babies.map((b) =>
        b.id === babyId ? { ...b, ...updates } : b
      ),
    });
  },

  /**
   * Reset store (for testing)
   */
  reset: () => {
    set({
      user: null,
      uid: null,
      isLoading: true,
      isInitialized: false,
      families: [],
      currentFamily: null,
      currentFamilyId: null,
      babies: [],
    });
  },
}));

/**
 * Selector helpers
 */
export const selectCurrentUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => !!state.user;
export const selectCurrentFamily = (state: AuthState) => state.currentFamily;
export const selectBabies = (state: AuthState) => state.babies;
export const selectIsAdmin = (state: AuthState) => {
  if (!state.currentFamily || !state.uid) return false;
  const member = state.currentFamily.members[state.uid];
  return member?.role === 'admin';
};
