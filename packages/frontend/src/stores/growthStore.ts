/**
 * Growth Entries Store
 *
 * Manages baby growth entries (weight, height, head circumference).
 */

import { create } from 'zustand';
import type {
  GrowthEntryDocument,
} from '../types/firestore';
import {
  getGrowthEntries,
  createGrowthEntry,
  updateGrowthEntry,
  deleteGrowthEntry,
} from '../lib/firebase/firestore';

/**
 * Growth state
 */
interface GrowthState {
  // Data
  entries: GrowthEntryDocument[];

  // Loading states
  isLoading: boolean;

  // Error state
  error: string | null;

  // Actions
  loadEntries: (familyId: string, babyId: string) => Promise<void>;
  createEntry: (
    familyId: string,
    babyId: string,
    entryData: Omit<GrowthEntryDocument, 'createdAt' | 'id' | 'createdByUid'>,
    uid: string
  ) => Promise<string>;
  updateEntry: (familyId: string, babyId: string, entryId: string, updates: Partial<Omit<GrowthEntryDocument, 'createdAt' | 'id' | 'createdByUid'>>) => Promise<void>;
  deleteEntry: (familyId: string, babyId: string, entryId: string) => Promise<void>;
  reset: () => void;
}

/**
 * Create the growth store
 */
export const useGrowthStore = create<GrowthState>((set, get) => ({
  // Initial state
  entries: [],
  isLoading: false,
  error: null,

  /**
   * Load growth entries
   */
  loadEntries: async (familyId, babyId) => {
    set({ isLoading: true, error: null });

    try {
      const { getFirestoreInstance } = await import('../lib/firebase/config');
      const db = await getFirestoreInstance();

      const entries = await getGrowthEntries(db, familyId, babyId);

      set({
        entries,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load growth entries',
        isLoading: false,
      });
    }
  },

  /**
   * Create a new growth entry
   */
  createEntry: async (familyId, babyId, entryData, uid) => {
    try {
      // Generate a local ID first
      const entryId = `growth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Add to local state
      const newEntry: GrowthEntryDocument = {
        ...entryData,
        id: entryId,
        createdByUid: uid,
        createdAt: new Date().toISOString(),
      };

      set({
        entries: [...get().entries, newEntry].sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
      });

      // Try to sync to Firestore (may fail in demo mode without backend)
      try {
        const { getFirestoreInstance } = await import('../lib/firebase/config');
        const db = await getFirestoreInstance();
        await createGrowthEntry(db, familyId, babyId, entryData, uid);
      } catch (firestoreError) {
        // If Firestore fails, we still have the entry in local state
        console.log('Growth entry saved locally (Firestore not available):', firestoreError);
      }

      return entryId;
    } catch (error) {
      console.error('Failed to create growth entry:', error);
      throw error;
    }
  },

  /**
   * Update a growth entry
   */
  updateEntry: async (familyId, babyId, entryId, updates) => {
    try {
      const { getFirestoreInstance } = await import('../lib/firebase/config');
      const db = await getFirestoreInstance();

      await updateGrowthEntry(db, familyId, babyId, entryId, updates);

      // Update local state
      set({
        entries: get().entries.map((e) =>
          e.id === entryId ? { ...e, ...updates } : e
        ),
      });
    } catch (error) {
      console.error('Failed to update growth entry:', error);
      throw error;
    }
  },

  /**
   * Delete a growth entry
   */
  deleteEntry: async (familyId, babyId, entryId) => {
    try {
      const { getFirestoreInstance } = await import('../lib/firebase/config');
      const db = await getFirestoreInstance();

      await deleteGrowthEntry(db, familyId, babyId, entryId);

      // Remove from local state
      set({
        entries: get().entries.filter((e) => e.id !== entryId),
      });
    } catch (error) {
      console.error('Failed to delete growth entry:', error);
      throw error;
    }
  },

  /**
   * Reset store
   */
  reset: () => {
    set({
      entries: [],
      isLoading: false,
      error: null,
    });
  },
}));
