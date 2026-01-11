/**
 * Firestore Document Type Definitions
 */

// Base document with timestamps
export interface BaseDocument {
  createdAt: string;
  updatedAt?: string;
}

// Family document
export interface FamilyDocument extends BaseDocument {
  id: string;
  name: string;
  members: Record<string, FamilyMember>;
}

export interface FamilyMember {
  role: 'admin' | 'viewer';
  displayName?: string;
  addedAt: string;
}

// Baby document
export interface BabyDocument extends BaseDocument {
  id: string;
  name: string;
  dob: string; // ISO 8601 date string
  gender?: 'male' | 'female';
  profilePicObjectKey?: string;
  profilePicUrl?: string; // Local preview URL for demo mode
}

// Moment document
export interface MomentDocument extends BaseDocument {
  id: string;
  mediaObjectKey: string;
  mediaType: 'photo' | 'video';
  contentType: string;
  fileSizeBytes?: number;
  dateTaken: string; // ISO 8601 datetime string
  dateKey: string; // YYYY-MM-DD
  caption?: string;
  createdByUid: string;
  exifData?: ExifData;
}

export interface ExifData {
  dateTimeOriginal?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  cameraMake?: string;
  cameraModel?: string;
}

// Comment document
export interface CommentDocument extends BaseDocument {
  text: string;
  createdByUid: string;
}

// Growth entry document
export interface GrowthEntryDocument extends BaseDocument {
  id: string;
  date: string; // ISO 8601 date string
  weightKg?: number;
  heightCm?: number;
  headCircumferenceCm?: number;
  notes?: string;
  createdByUid: string;
}

// Capsule document
export interface CapsuleDocument extends BaseDocument {
  id: string;
  title: string;
  content?: string;
  coverObjectKey?: string;
  objectKeys: string[]; // Array of media object keys
  unlockAt: string; // ISO 8601 datetime string
  createdByUid: string;
}

// Query options
export interface QueryOptions {
  limit?: number;
  startAfter?: string;
  orderBy?: 'dateTaken' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}

// Paginated result
export interface PaginatedResult<T> {
  items: T[];
  lastDocId: string | null;
  hasMore: boolean;
}
