/**
 * Authentication Store
 *
 * Manages authentication state using Zustand.
 * Integrates with Firebase Auth for email link authentication.
 * Supports demo mode for testing without backend.
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
  getIdToken,
  completeEmailLinkSignIn,
} from '../lib/firebase/auth';
import type { User } from 'firebase/auth';
import type { FamilyDocument, BabyDocument } from '../types/firestore';
import {
  getFamily,
  getUserFamilies,
  getBabies,
  updateBaby,
} from '../lib/firebase/firestore';

/**
 * Demo mode data
 */
const DEMO_USER = { uid: 'demo-user', email: 'demo@example.com' } as any;
const DEMO_FAMILY: FamilyDocument = {
  id: 'demo-family',
  name: 'Demo Family',
  members: { 'demo-user': { role: 'admin' as const, addedAt: new Date().toISOString() } },
  createdAt: new Date().toISOString(),
};
const DEMO_BABY: BabyDocument = {
  id: 'demo-baby',
  name: 'Baby Luna',
  dob: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
  gender: 'female',
  createdAt: new Date().toISOString(),
};

/**
 * Authentication state
 */
interface AuthState {
  // User state
  user: User | null;
  uid: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  isDemoMode: boolean;

  // Family state
  families: FamilyDocument[];
  currentFamily: FamilyDocument | null;
  currentFamilyId: string | null;

  // Babies state
  babies: BabyDocument[];

  // Actions
  initialize: () => Promise<void>;
  setEmailLinkSignIn: () => Promise<void>;
  signOut: () => Promise<void>;
  setDemoMode: () => void;
  setCurrentFamily: (familyId: string) => Promise<void>;
  reloadFamilies: () => Promise<void>;
  reloadBabies: () => Promise<void>;
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
  isDemoMode: false,
  families: [],
  currentFamily: null,
  currentFamilyId: null,
  babies: [],

  /**
   * Initialize authentication - check for email link sign-in or demo mode
   */
  initialize: async () => {
    // Check for demo mode in sessionStorage
    const isDemoMode = sessionStorage.getItem('demo-mode') === 'true';

    if (isDemoMode) {
      // Restore demo mode state
      set({
        user: DEMO_USER,
        uid: DEMO_USER.uid,
        isLoading: false,
        isInitialized: true,
        isDemoMode: true,
        families: [DEMO_FAMILY],
        currentFamily: DEMO_FAMILY,
        currentFamilyId: DEMO_FAMILY.id,
        babies: [DEMO_BABY],
      });
      return;
    }

    const auth = getAuthInstance();

    // Check if this is an email link sign-in completion
    try {
      const result = await completeEmailLinkSignIn(auth);
      if (result) {
        console.log('[Auth] Email link sign-in completed');
      }
    } catch (error) {
      console.error('[Auth] Email link sign-in check failed:', error);
    }

    // Set up auth state listener
    const unsubscribe = onAuthStateChange(auth, async (user) => {
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

    // Store unsubscribe for cleanup
    set({ _unsubscribe: unsubscribe as any });
  },

  /**
   * Initiate email link sign-in
   */
  setEmailLinkSignIn: async () => {
    // This is handled by the sendEmailLink function in auth.ts
    // This function is a placeholder for any UI-side actions needed
    console.log('[Auth] Email link sign-in initiated');
  },

  /**
   * Sign out
   */
  signOut: async () => {
    // Clear demo mode
    sessionStorage.removeItem('demo-mode');
    set({ isDemoMode: false });

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
   * Enable demo mode
   */
  setDemoMode: () => {
    sessionStorage.setItem('demo-mode', 'true');
    set({
      user: DEMO_USER,
      uid: DEMO_USER.uid,
      isLoading: false,
      isInitialized: true,
      isDemoMode: true,
      families: [DEMO_FAMILY],
      currentFamily: DEMO_FAMILY,
      currentFamilyId: DEMO_FAMILY.id,
      babies: [DEMO_BABY],
    });
  },

  /**
   * Set current family
   */
  setCurrentFamily: async (familyId: string) => {
    // Demo mode shortcut
    if (get().isDemoMode && familyId === 'demo-family') {
      set({
        currentFamily: DEMO_FAMILY,
        currentFamilyId: DEMO_FAMILY.id,
        babies: [DEMO_BABY],
      });
      localStorage.setItem('timehut_current_family_id', familyId);
      return;
    }

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
    const { uid, isDemoMode } = get();
    if (isDemoMode) return; // Skip in demo mode
    if (!uid) return;

    const db = await getFirestoreInstance();
    const families = await getUserFamilies(db, uid);

    set({ families });
  },

  /**
   * Reload babies for current family
   */
  reloadBabies: async () => {
    const { currentFamilyId, isDemoMode } = get();
    if (isDemoMode) return; // Skip in demo mode
    if (!currentFamilyId) return;

    const db = await getFirestoreInstance();
    const babies = await getBabies(db, currentFamilyId);

    set({ babies });
  },

  /**
   * Update baby profile
   */
  updateBaby: async (babyId, updates) => {
    const { currentFamilyId, isDemoMode } = get();

    // Update local state immediately for demo mode
    if (isDemoMode) {
      set({
        babies: get().babies.map((b) =>
          b.id === babyId ? { ...b, ...updates } : b
        ),
      });
      return;
    }

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
    sessionStorage.removeItem('demo-mode');
    set({
      user: null,
      uid: null,
      isLoading: true,
      isInitialized: false,
      isDemoMode: false,
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
