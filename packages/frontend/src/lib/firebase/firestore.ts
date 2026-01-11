/**
 * Firestore Helper Functions
 *
 * Provides typed functions for all Firestore operations.
 */

import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import type {
  FamilyDocument,
  BabyDocument,
  MomentDocument,
  CommentDocument,
  GrowthEntryDocument,
  CapsuleDocument,
  QueryOptions,
  PaginatedResult,
} from '../../types/firestore';

// Collection references helpers
const familiesCollection = (db: Firestore) => collection(db, 'families');
const familyDoc = (db: Firestore, familyId: string) => doc(db, 'families', familyId);

const babiesCollection = (db: Firestore, familyId: string) =>
  collection(db, 'families', familyId, 'babies');
const babyDoc = (db: Firestore, familyId: string, babyId: string) =>
  doc(db, 'families', familyId, 'babies', babyId);

const momentsCollection = (db: Firestore, familyId: string, babyId: string) =>
  collection(db, 'families', familyId, 'babies', babyId, 'moments');
const momentDoc = (db: Firestore, familyId: string, babyId: string, momentId: string) =>
  doc(db, 'families', familyId, 'babies', babyId, 'moments', momentId);

const commentsCollection = (db: Firestore, familyId: string, babyId: string, momentId: string) =>
  collection(db, 'families', familyId, 'babies', babyId, 'moments', momentId, 'comments');
const commentDoc = (db: Firestore, familyId: string, babyId: string, momentId: string, commentId: string) =>
  doc(db, 'families', familyId, 'babies', babyId, 'moments', momentId, 'comments', commentId);

const growthEntriesCollection = (db: Firestore, familyId: string, babyId: string) =>
  collection(db, 'families', familyId, 'babies', babyId, 'growth_entries');
const growthEntryDoc = (db: Firestore, familyId: string, babyId: string, entryId: string) =>
  doc(db, 'families', familyId, 'babies', babyId, 'growth_entries', entryId);

const capsulesCollection = (db: Firestore, familyId: string, babyId: string) =>
  collection(db, 'families', familyId, 'babies', babyId, 'capsules');
const capsuleDoc = (db: Firestore, familyId: string, babyId: string, capsuleId: string) =>
  doc(db, 'families', familyId, 'babies', babyId, 'capsules', capsuleId);

// ============================================================================
// FAMILY OPERATIONS
// ============================================================================

/**
 * Get family document
 */
export async function getFamily(db: Firestore, familyId: string): Promise<FamilyDocument | null> {
  const docRef = familyDoc(db, familyId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as FamilyDocument;
}

/**
 * Create a new family
 */
export async function createFamily(
  db: Firestore,
  name: string,
  adminUid: string
): Promise<string> {
  const docRef = await addDoc(familiesCollection(db), {
    name,
    members: {
      [adminUid]: {
        role: 'admin',
        addedAt: new Date().toISOString(),
      },
    },
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

/**
 * Add a member to a family
 */
export async function addFamilyMember(
  db: Firestore,
  familyId: string,
  uid: string,
  role: 'admin' | 'viewer',
  displayName?: string
): Promise<void> {
  const memberRef = doc(db, 'families', familyId, 'members', uid);
  await setDoc(memberRef, {
    role,
    displayName: displayName || null,
    addedAt: new Date().toISOString(),
  });
}

/**
 * Update family member role
 */
export async function updateFamilyMember(
  db: Firestore,
  familyId: string,
  uid: string,
  updates: Partial<{ role: 'admin' | 'viewer'; displayName: string }>
): Promise<void> {
  const memberRef = doc(db, 'families', familyId, 'members', uid);
  await updateDoc(memberRef, updates);
}

/**
 * Remove a family member
 */
export async function removeFamilyMember(db: Firestore, familyId: string, uid: string): Promise<void> {
  const memberRef = doc(db, 'families', familyId, 'members', uid);
  await deleteDoc(memberRef);
}

/**
 * Get user's families (where they are a member)
 */
export async function getUserFamilies(db: Firestore, uid: string): Promise<FamilyDocument[]> {
  // Query members subcollections to find families where user is a member
  // This requires a collection group query
  const membersQuery = query(
    collection(db, 'families'),
    where(`members.${uid}.role`, 'in', ['admin', 'viewer'])
  );

  const querySnapshot = await getDocs(membersQuery);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as FamilyDocument[];
}

// ============================================================================
// BABY OPERATIONS
// ============================================================================

/**
 * Get all babies for a family
 */
export async function getBabies(db: Firestore, familyId: string): Promise<BabyDocument[]> {
  const querySnapshot = await getDocs(babiesCollection(db, familyId));

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as BabyDocument[];
}

/**
 * Get a specific baby
 */
export async function getBaby(
  db: Firestore,
  familyId: string,
  babyId: string
): Promise<BabyDocument | null> {
  const docSnap = await getDoc(babyDoc(db, familyId, babyId));

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as BabyDocument;
}

/**
 * Create a new baby
 */
export async function createBaby(
  db: Firestore,
  familyId: string,
  babyData: Omit<BabyDocument, 'createdAt' | 'id'>
): Promise<string> {
  const docRef = await addDoc(babiesCollection(db, familyId), {
    ...babyData,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

/**
 * Update a baby
 */
export async function updateBaby(
  db: Firestore,
  familyId: string,
  babyId: string,
  updates: Partial<Omit<BabyDocument, 'createdAt' | 'id'>>
): Promise<void> {
  await updateDoc(babyDoc(db, familyId, babyId), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a baby
 */
export async function deleteBaby(db: Firestore, familyId: string, babyId: string): Promise<void> {
  await deleteDoc(babyDoc(db, familyId, babyId));
}

// ============================================================================
// MOMENT OPERATIONS
// ============================================================================

/**
 * Get moments with pagination
 */
export async function getMoments(
  db: Firestore,
  familyId: string,
  babyId: string,
  options: QueryOptions = {}
): Promise<PaginatedResult<MomentDocument>> {
  const {
    limit: limitCount = 20,
    startAfter: startAfterId,
    orderBy: orderByField = 'dateTaken',
    orderDirection = 'desc',
  } = options;

  let q = query(
    momentsCollection(db, familyId, babyId),
    orderBy(orderByField, orderDirection === 'desc' ? 'desc' : 'asc'),
    limit(limitCount)
  );

  if (startAfterId) {
    const startDoc = await getDoc(momentDoc(db, familyId, babyId, startAfterId));
    if (startDoc.exists()) {
      q = query(
        momentsCollection(db, familyId, babyId),
        orderBy(orderByField, orderDirection === 'desc' ? 'desc' : 'asc'),
        startAfter(startDoc),
        limit(limitCount)
      );
    }
  }

  const querySnapshot = await getDocs(q);
  const items = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MomentDocument[];

  return {
    items,
    lastDocId: querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1].id : null,
    hasMore: querySnapshot.docs.length === limitCount,
  };
}

/**
 * Get moments for a date range (for calendar view)
 */
export async function getMomentsForDateRange(
  db: Firestore,
  familyId: string,
  babyId: string,
  startDate: Date,
  endDate: Date
): Promise<MomentDocument[]> {
  const q = query(
    momentsCollection(db, familyId, babyId),
    where('dateTaken', '>=', Timestamp.fromDate(startDate)),
    where('dateTaken', '<', Timestamp.fromDate(endDate)),
    orderBy('dateTaken', 'asc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MomentDocument[];
}

/**
 * Get moments by dateKey
 */
export async function getMomentsByDateKey(
  db: Firestore,
  familyId: string,
  babyId: string,
  dateKey: string
): Promise<MomentDocument[]> {
  const q = query(
    momentsCollection(db, familyId, babyId),
    where('dateKey', '==', dateKey),
    orderBy('dateTaken', 'desc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MomentDocument[];
}

/**
 * Get a specific moment
 */
export async function getMoment(
  db: Firestore,
  familyId: string,
  babyId: string,
  momentId: string
): Promise<MomentDocument | null> {
  const docSnap = await getDoc(momentDoc(db, familyId, babyId, momentId));

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as MomentDocument;
}

/**
 * Create a new moment
 */
export async function createMoment(
  db: Firestore,
  familyId: string,
  babyId: string,
  momentData: Omit<MomentDocument, 'createdAt' | 'id' | 'createdByUid'>,
  createdByUid: string
): Promise<string> {
  const docRef = await addDoc(momentsCollection(db, familyId, babyId), {
    ...momentData,
    createdByUid,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

/**
 * Update a moment
 */
export async function updateMoment(
  db: Firestore,
  familyId: string,
  babyId: string,
  momentId: string,
  updates: Partial<Omit<MomentDocument, 'createdAt' | 'id' | 'createdByUid'>>
): Promise<void> {
  await updateDoc(momentDoc(db, familyId, babyId, momentId), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a moment
 */
export async function deleteMoment(
  db: Firestore,
  familyId: string,
  babyId: string,
  momentId: string
): Promise<void> {
  await deleteDoc(momentDoc(db, familyId, babyId, momentId));
}

// ============================================================================
// COMMENT OPERATIONS
// ============================================================================

/**
 * Get comments for a moment
 */
export async function getComments(
  db: Firestore,
  familyId: string,
  babyId: string,
  momentId: string,
  limitCount = 50
): Promise<CommentDocument[]> {
  const q = query(
    commentsCollection(db, familyId, babyId, momentId),
    orderBy('createdAt', 'asc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<CommentDocument, 'id'>),
  }));
}

/**
 * Add a comment to a moment
 */
export async function addComment(
  db: Firestore,
  familyId: string,
  babyId: string,
  momentId: string,
  text: string,
  createdByUid: string
): Promise<string> {
  const docRef = await addDoc(commentsCollection(db, familyId, babyId, momentId), {
    text,
    createdByUid,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

/**
 * Update a comment
 */
export async function updateComment(
  db: Firestore,
  familyId: string,
  babyId: string,
  momentId: string,
  commentId: string,
  text: string
): Promise<void> {
  await updateDoc(commentDoc(db, familyId, babyId, momentId, commentId), {
    text,
  });
}

/**
 * Delete a comment
 */
export async function deleteComment(
  db: Firestore,
  familyId: string,
  babyId: string,
  momentId: string,
  commentId: string
): Promise<void> {
  await deleteDoc(commentDoc(db, familyId, babyId, momentId, commentId));
}

// ============================================================================
// GROWTH ENTRY OPERATIONS
// ============================================================================

/**
 * Get all growth entries for a baby
 */
export async function getGrowthEntries(
  db: Firestore,
  familyId: string,
  babyId: string
): Promise<GrowthEntryDocument[]> {
  const q = query(
    growthEntriesCollection(db, familyId, babyId),
    orderBy('date', 'asc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as GrowthEntryDocument[];
}

/**
 * Create a growth entry
 */
export async function createGrowthEntry(
  db: Firestore,
  familyId: string,
  babyId: string,
  entryData: Omit<GrowthEntryDocument, 'createdAt' | 'id' | 'createdByUid'>,
  createdByUid: string
): Promise<string> {
  const docRef = await addDoc(growthEntriesCollection(db, familyId, babyId), {
    ...entryData,
    createdByUid,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

/**
 * Update a growth entry
 */
export async function updateGrowthEntry(
  db: Firestore,
  familyId: string,
  babyId: string,
  entryId: string,
  updates: Partial<Omit<GrowthEntryDocument, 'createdAt' | 'id' | 'createdByUid'>>
): Promise<void> {
  await updateDoc(growthEntryDoc(db, familyId, babyId, entryId), updates);
}

/**
 * Delete a growth entry
 */
export async function deleteGrowthEntry(
  db: Firestore,
  familyId: string,
  babyId: string,
  entryId: string
): Promise<void> {
  await deleteDoc(growthEntryDoc(db, familyId, babyId, entryId));
}

// ============================================================================
// CAPSULE OPERATIONS
// ============================================================================

/**
 * Get all capsules for a baby
 */
export async function getCapsules(
  db: Firestore,
  familyId: string,
  babyId: string
): Promise<CapsuleDocument[]> {
  const q = query(
    capsulesCollection(db, familyId, babyId),
    orderBy('unlockAt', 'asc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CapsuleDocument[];
}

/**
 * Get a specific capsule
 */
export async function getCapsule(
  db: Firestore,
  familyId: string,
  babyId: string,
  capsuleId: string
): Promise<CapsuleDocument | null> {
  const docSnap = await getDoc(capsuleDoc(db, familyId, babyId, capsuleId));

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as CapsuleDocument;
}

/**
 * Create a new capsule
 */
export async function createCapsule(
  db: Firestore,
  familyId: string,
  babyId: string,
  capsuleData: Omit<CapsuleDocument, 'createdAt' | 'id' | 'createdByUid'>,
  createdByUid: string
): Promise<string> {
  const docRef = await addDoc(capsulesCollection(db, familyId, babyId), {
    ...capsuleData,
    createdByUid,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

/**
 * Update a capsule
 */
export async function updateCapsule(
  db: Firestore,
  familyId: string,
  babyId: string,
  capsuleId: string,
  updates: Partial<Omit<CapsuleDocument, 'createdAt' | 'id' | 'createdByUid'>>
): Promise<void> {
  await updateDoc(capsuleDoc(db, familyId, babyId, capsuleId), updates);
}

/**
 * Delete a capsule
 */
export async function deleteCapsule(
  db: Firestore,
  familyId: string,
  babyId: string,
  capsuleId: string
): Promise<void> {
  await deleteDoc(capsuleDoc(db, familyId, babyId, capsuleId));
}
