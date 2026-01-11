/**
 * Moments Store
 *
 * Manages timeline moments state with infinite scroll pagination.
 */

import { create } from 'zustand';
import type {
  MomentDocument,
  CommentDocument,
  QueryOptions,
  PaginatedResult,
} from '../types/firestore';
import {
  getMoments,
  getComments,
  addComment,
  updateComment,
  deleteComment,
  updateMoment,
  deleteMoment,
  createMoment,
} from '../lib/firebase/firestore';
import { getCachedMediaUrl } from '../lib/api/media';

/**
 * Extended moment with display URL
 */
export interface MomentWithUrl extends MomentDocument {
  id: string;
  displayUrl?: string;
  isUrlLoading: boolean;
}

/**
 * Moment state
 */
interface MomentState {
  // Data
  moments: MomentWithUrl[];
  lastDocId: string | null;
  hasMore: boolean;

  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;

  // Comments cache (momentId -> comments)
  commentsCache: Record<string, CommentDocument[]>;

  // Error state
  error: string | null;

  // Actions
  loadMoments: (familyId: string, babyId: string, options?: QueryOptions) => Promise<void>;
  loadMoreMoments: () => Promise<void>;
  refreshMoments: () => Promise<void>;
  loadMomentUrl: (familyId: string, objectKey: string) => Promise<string | null>;
  loadAllVisibleUrls: () => Promise<void>;
  reset: () => void;

  // Comment actions
  loadComments: (momentId: string) => Promise<void>;
  addComment: (familyId: string, babyId: string, momentId: string, text: string, uid: string) => Promise<void>;
  updateComment: (familyId: string, babyId: string, momentId: string, commentId: string, text: string) => Promise<void>;
  deleteComment: (familyId: string, babyId: string, momentId: string, commentId: string) => Promise<void>;

  // Moment actions
  createMoment: (familyId: string, babyId: string, momentData: Omit<MomentDocument, 'createdAt' | 'id' | 'createdByUid'>, uid: string, localPreview?: { url: string; file: File }) => Promise<string>;
  updateCaption: (familyId: string, babyId: string, momentId: string, caption: string) => Promise<void>;
  deleteMoment: (familyId: string, babyId: string, momentId: string) => Promise<void>;
}

/**
 * Helper: Convert MomentDocument to MomentWithUrl
 */
function toMomentWithUrl(moment: MomentDocument): MomentWithUrl {
  return {
    ...moment,
    id: moment.id!,
    displayUrl: undefined,
    isUrlLoading: false,
  };
}

/**
 * Create the moments store
 */
export const useMomentStore = create<MomentState>((set, get) => ({
  // Initial state
  moments: [],
  lastDocId: null,
  hasMore: true,
  isLoading: false,
  isLoadingMore: false,
  isRefreshing: false,
  commentsCache: {},
  error: null,

  /**
   * Load initial moments
   */
  loadMoments: async (familyId, babyId, options) => {
    set({ isLoading: true, error: null });

    try {
      const { getFirestoreInstance } = await import('../lib/firebase/config');
      const db = await getFirestoreInstance();

      const result: PaginatedResult<MomentDocument> = await getMoments(db, familyId, babyId, options);

      const momentsWithUrls = result.items.map(toMomentWithUrl);

      set({
        moments: momentsWithUrls,
        lastDocId: result.lastDocId,
        hasMore: result.hasMore,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load moments',
        isLoading: false,
      });
    }
  },

  /**
   * Load more moments (pagination)
   */
  loadMoreMoments: async () => {
    const { lastDocId, hasMore, isLoadingMore, moments } = get();

    if (!hasMore || isLoadingMore || !lastDocId) {
      return;
    }

    set({ isLoadingMore: true });

    try {
      // Get current family/baby from auth store
      const { useAuthStore } = await import('./authStore');
      const currentFamilyId = useAuthStore.getState().currentFamilyId;
      const babies = useAuthStore.getState().babies;
      const currentBaby = babies[0]; // TODO: handle multiple babies

      if (!currentFamilyId || !currentBaby) {
        throw new Error('No family or baby selected');
      }

      const { getFirestoreInstance } = await import('../lib/firebase/config');
      const db = await getFirestoreInstance();

      const result: PaginatedResult<MomentDocument> = await getMoments(
        db,
        currentFamilyId,
        currentBaby.id!,
        {
          startAfter: lastDocId,
          limit: 20,
        }
      );

      const newMoments = result.items.map(toMomentWithUrl);

      set({
        moments: [...moments, ...newMoments],
        lastDocId: result.lastDocId,
        hasMore: result.hasMore,
        isLoadingMore: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load more moments',
        isLoadingMore: false,
      });
    }
  },

  /**
   * Refresh moments (pull-to-refresh)
   */
  refreshMoments: async () => {
    set({ isRefreshing: true });

    try {
      const { useAuthStore } = await import('./authStore');
      const currentFamilyId = useAuthStore.getState().currentFamilyId;
      const babies = useAuthStore.getState().babies;
      const currentBaby = babies[0];

      if (!currentFamilyId || !currentBaby) {
        throw new Error('No family or baby selected');
      }

      const { getFirestoreInstance } = await import('../lib/firebase/config');
      const db = await getFirestoreInstance();

      const result: PaginatedResult<MomentDocument> = await getMoments(
        db,
        currentFamilyId,
        currentBaby.id!
      );

      const momentsWithUrls = result.items.map(toMomentWithUrl);

      set({
        moments: momentsWithUrls,
        lastDocId: result.lastDocId,
        hasMore: result.hasMore,
        isRefreshing: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to refresh moments',
        isRefreshing: false,
      });
    }
  },

  /**
   * Load signed URL for a moment's media
   */
  loadMomentUrl: async (familyId, objectKey) => {
    try {
      const url = await getCachedMediaUrl(familyId, objectKey);
      return url;
    } catch (error) {
      console.error('Failed to load moment URL:', error);
      return null;
    }
  },

  /**
   * Load all visible moment URLs (for initial viewport)
   */
  loadAllVisibleUrls: async () => {
    const { moments } = get();

    // Get current family from auth store
    const { useAuthStore } = await import('./authStore');
    const currentFamilyId = useAuthStore.getState().currentFamilyId;

    if (!currentFamilyId) return;

    // Update loading state for moments without URLs
    set({
      moments: moments.map((m) =>
        !m.displayUrl && !m.isUrlLoading
          ? { ...m, isUrlLoading: true }
          : m
      ),
    });

    // Load URLs in parallel (limit concurrency)
    const momentsNeedingUrls = moments.filter((m) => !m.displayUrl);

    for (const moment of momentsNeedingUrls) {
      const url = await get().loadMomentUrl(currentFamilyId, moment.mediaObjectKey);

      set({
        moments: get().moments.map((m) =>
          m.id === moment.id
            ? { ...m, displayUrl: url || undefined, isUrlLoading: false }
            : m
        ),
      });
    }
  },

  /**
   * Load comments for a moment
   */
  loadComments: async (momentId) => {
    try {
      const { useAuthStore } = await import('./authStore');
      const currentFamilyId = useAuthStore.getState().currentFamilyId;
      const babies = useAuthStore.getState().babies;
      const currentBaby = babies[0];

      if (!currentFamilyId || !currentBaby) return;

      const { getFirestoreInstance } = await import('../lib/firebase/config');
      const db = await getFirestoreInstance();

      const comments = await getComments(db, currentFamilyId, currentBaby.id!, momentId);

      set({
        commentsCache: {
          ...get().commentsCache,
          [momentId]: comments,
        },
      });
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  },

  /**
   * Add a comment
   */
  addComment: async (familyId, babyId, momentId, text, uid) => {
    try {
      const { getFirestoreInstance } = await import('../lib/firebase/config');
      const db = await getFirestoreInstance();

      await addComment(db, familyId, babyId, momentId, text, uid);

      // Reload comments
      await get().loadComments(momentId);
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  },

  /**
   * Update a comment
   */
  updateComment: async (familyId, babyId, momentId, commentId, text) => {
    try {
      const { getFirestoreInstance } = await import('../lib/firebase/config');
      const db = await getFirestoreInstance();

      await updateComment(db, familyId, babyId, momentId, commentId, text);

      // Reload comments
      await get().loadComments(momentId);
    } catch (error) {
      console.error('Failed to update comment:', error);
      throw error;
    }
  },

  /**
   * Delete a comment
   */
  deleteComment: async (familyId, babyId, momentId, commentId) => {
    try {
      const { getFirestoreInstance } = await import('../lib/firebase/config');
      const db = await getFirestoreInstance();

      await deleteComment(db, familyId, babyId, momentId, commentId);

      // Reload comments
      await get().loadComments(momentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    }
  },

  /**
   * Create a new moment
   */
  createMoment: async (familyId, babyId, momentData, uid, localPreview) => {
    try {
      // Generate a local ID first
      const momentId = `moment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Add to local state with preview URL if provided
      const newMoment: MomentWithUrl = {
        ...momentData,
        id: momentId,
        createdByUid: uid,
        createdAt: new Date().toISOString(),
        displayUrl: localPreview?.url,
        isUrlLoading: false,
      };

      set({
        moments: [newMoment, ...get().moments],
      });

      // Try to sync to Firestore (may fail in demo mode without backend)
      try {
        const { getFirestoreInstance } = await import('../lib/firebase/config');
        const db = await getFirestoreInstance();
        await createMoment(db, familyId, babyId, momentData, uid);
      } catch (firestoreError) {
        // If Firestore fails, we still have the moment in local state
        console.log('Moment saved locally (Firestore not available):', firestoreError);
      }

      return momentId;
    } catch (error) {
      console.error('Failed to create moment:', error);
      throw error;
    }
  },

  /**
   * Update moment caption
   */
  updateCaption: async (familyId, babyId, momentId, caption) => {
    try {
      const { getFirestoreInstance } = await import('../lib/firebase/config');
      const db = await getFirestoreInstance();

      await updateMoment(db, familyId, babyId, momentId, { caption });

      // Update local state
      set({
        moments: get().moments.map((m) =>
          m.id === momentId ? { ...m, caption } : m
        ),
      });
    } catch (error) {
      console.error('Failed to update caption:', error);
      throw error;
    }
  },

  /**
   * Delete a moment
   */
  deleteMoment: async (familyId, babyId, momentId) => {
    try {
      const { getFirestoreInstance } = await import('../lib/firebase/config');
      const db = await getFirestoreInstance();

      await deleteMoment(db, familyId, babyId, momentId);

      // Remove from local state
      set({
        moments: get().moments.filter((m) => m.id !== momentId),
      });
    } catch (error) {
      console.error('Failed to delete moment:', error);
      throw error;
    }
  },

  /**
   * Reset store
   */
  reset: () => {
    set({
      moments: [],
      lastDocId: null,
      hasMore: true,
      isLoading: false,
      isLoadingMore: false,
      isRefreshing: false,
      commentsCache: {},
      error: null,
    });
  },
}));

/**
 * Helper: Get comments for a moment
 */
export const getCommentsForMoment = (momentId: string) => {
  return useMomentStore.getState().commentsCache[momentId] || [];
};
