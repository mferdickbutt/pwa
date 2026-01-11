/**
 * Capsules Store
 *
 * Manages time capsules for baby memories.
 */

import { create } from 'zustand';
import type {
  CapsuleDocument,
} from '../types/firestore';
import {
  getCapsules,
  createCapsule,
  updateCapsule,
  deleteCapsule,
} from '../lib/firebase/firestore';

/**
 * Capsule state
 */
interface CapsuleState {
  // Data
  capsules: CapsuleDocument[];

  // Loading states
  isLoading: boolean;

  // Error state
  error: string | null;

  // Actions
  loadCapsules: (familyId: string, babyId: string) => Promise<void>;
  createCapsule: (
    familyId: string,
    babyId: string,
    capsuleData: Omit<CapsuleDocument, 'createdAt' | 'id' | 'createdByUid'>,
    uid: string
  ) => Promise<string>;
  updateCapsule: (familyId: string, babyId: string, capsuleId: string, updates: Partial<Omit<CapsuleDocument, 'createdAt' | 'id' | 'createdByUid'>>) => Promise<void>;
  deleteCapsule: (familyId: string, babyId: string, capsuleId: string) => Promise<void>;
  reset: () => void;
}

/**
 * Create the capsules store
 */
export const useCapsuleStore = create<CapsuleState>((set, get) => ({
  // Initial state
  capsules: [],
  isLoading: false,
  error: null,

  /**
   * Load capsules
   */
  loadCapsules: async (familyId, babyId) => {
    set({ isLoading: true, error: null });

    try {
      const { getFirestoreInstance } = await import('../lib/firebase/config');
      const db = await getFirestoreInstance();

      const capsules = await getCapsules(db, familyId, babyId);

      set({
        capsules,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load capsules',
        isLoading: false,
      });
    }
  },

  /**
   * Create a new capsule
   */
  createCapsule: async (familyId, babyId, capsuleData, uid) => {
    try {
      // Generate a local ID first
      const capsuleId = `capsule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Add to local state
      const newCapsule: CapsuleDocument = {
        ...capsuleData,
        id: capsuleId,
        createdByUid: uid,
        createdAt: new Date().toISOString(),
      };

      set({
        capsules: [...get().capsules, newCapsule].sort((a, b) =>
          new Date(a.unlockAt).getTime() - new Date(b.unlockAt).getTime()
        ),
      });

      // Try to sync to Firestore (may fail in demo mode without backend)
      try {
        const { getFirestoreInstance } = await import('../lib/firebase/config');
        const db = await getFirestoreInstance();
        await createCapsule(db, familyId, babyId, capsuleData, uid);
      } catch (firestoreError) {
        // If Firestore fails, we still have the capsule in local state
        console.log('Capsule saved locally (Firestore not available):', firestoreError);
      }

      return capsuleId;
    } catch (error) {
      console.error('Failed to create capsule:', error);
      throw error;
    }
  },

  /**
   * Update a capsule
   */
  updateCapsule: async (familyId, babyId, capsuleId, updates) => {
    try {
      const { getFirestoreInstance } = await import('../lib/firebase/config');
      const db = await getFirestoreInstance();

      await updateCapsule(db, familyId, babyId, capsuleId, updates);

      // Update local state
      set({
        capsules: get().capsules.map((c) =>
          c.id === capsuleId ? { ...c, ...updates } : c
        ),
      });
    } catch (error) {
      console.error('Failed to update capsule:', error);
      throw error;
    }
  },

  /**
   * Delete a capsule
   */
  deleteCapsule: async (familyId, babyId, capsuleId) => {
    try {
      const { getFirestoreInstance } = await import('../lib/firebase/config');
      const db = await getFirestoreInstance();

      await deleteCapsule(db, familyId, babyId, capsuleId);

      // Remove from local state
      set({
        capsules: get().capsules.filter((c) => c.id !== capsuleId),
      });
    } catch (error) {
      console.error('Failed to delete capsule:', error);
      throw error;
    }
  },

  /**
   * Reset store
   */
  reset: () => {
    set({
      capsules: [],
      isLoading: false,
      error: null,
    });
  },
}));
