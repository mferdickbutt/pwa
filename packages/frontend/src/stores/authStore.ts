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
  createFamily,
  createBaby,
} from '../lib/firebase/firestore';

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
  createBaby: (name: string, dob: string, gender: 'male' | 'female') => Promise<void>;
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
    const auth = getAuthInstance();

    // Set up auth state listener
    onAuthStateChange(auth, async (user) => {
      set({
        user,
        uid: user?.uid || null,
        isLoading: false,
        isInitialized: true,
      });

      // Load user's families if authenticated
      if (user) {
        await get().reloadFamilies();

        // Restore current family from localStorage
        const savedFamilyId = localStorage.getItem('timehut_current_family_id');
        if (savedFamilyId) {
          await get().setCurrentFamily(savedFamilyId);
        } else if (get().families.length > 0) {
          // Default to first family
          await get().setCurrentFamily(get().families[0].id!);
        }
      } else {
        // Clear state on sign out
        set({
          families: [],
          currentFamily: null,
          currentFamilyId: null,
          babies: [],
        });
      }
    });
  },

  /**
   * Sign out
   */
  signOut: async () => {
    const auth = getAuthInstance();
    await firebaseSignOut(auth);
    localStorage.removeItem('timehut_current_family_id');
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
    if (!uid) throw new Error('Not authenticated');

    const db = await getFirestoreInstance();
    const familyId = await createFamily(db, name.trim(), uid);

    // Reload families and set as current
    await get().reloadFamilies();
    await get().setCurrentFamily(familyId);

    return familyId;
  },

  /**
   * Set current family
   */
  setCurrentFamily: async (familyId: string) => {
    const auth = getAuthInstance();
    const user = getCurrentUser(auth);

    if (!user) {
      console.warn('[Auth] Cannot set family: not authenticated');
      return;
    }

    // Load family data
    const db = await getFirestoreInstance();
    const family = await getFamily(db, familyId);

    if (!family) {
      console.error(`[Auth] Family ${familyId} not found`);
      return;
    }

    // Check if user is a member
    if (!family.members[user.uid]) {
      console.error(`[Auth] User is not a member of family ${familyId}`);
      return;
    }

    set({
      currentFamily: family,
      currentFamilyId: familyId,
    });

    // Save to localStorage
    localStorage.setItem('timehut_current_family_id', familyId);

    // Load babies for this family
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
    if (!currentFamilyId) throw new Error('No family selected');

    const db = await getFirestoreInstance();
    const babyId = await createBaby(db, currentFamilyId, {
      name: name.trim(),
      dob,
      gender,
    });

    // Reload babies
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

    // Update in Firestore
    const db = await getFirestoreInstance();
    await updateBaby(db, currentFamilyId, babyId, updates);

    // Update local state
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
