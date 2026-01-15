/**
 * Media API Client
 *
 * Handles communication with the Media API for presigned URLs
 * and direct upload/download to/from S3-compatible storage (R2/MinIO).
 */

import { getAuthInstance } from '../firebase/config';
import { getIdToken } from '../firebase/auth';

const MEDIA_API_URL = import.meta.env.VITE_MEDIA_API_URL || '';

/**
 * Presign upload request options
 */
export interface PresignUploadOptions {
  familyId: string;
  babyId: string;
  contentType: string;
  fileSizeBytes: number;
  mediaType: 'photo' | 'video';
  originalFilename?: string;
  uploadId?: string;
}

/**
 * Presign upload response
 */
export interface PresignUploadResponse {
  objectKey: string;
  signedPutUrl: string;
  requiredHeaders: {
    'Content-Type': string;
  };
  expiresAt: string;
}

/**
 * Signed read response
 */
export interface SignedReadResponse {
  signedGetUrl: string;
  expiresAt: string;
}

/**
 * Upload media result
 */
export interface UploadMediaResult {
  objectKey: string;
  contentType: string;
  fileSizeBytes: number;
}

/**
 * Progress callback for upload
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Get auth headers for API requests
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const auth = await getAuthInstance();
  const idToken = await getIdToken(auth);

  if (!idToken) {
    throw new Error('Not authenticated');
  }

  return {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Request presigned URL for upload
 */
export async function presignUpload(
  options: PresignUploadOptions
): Promise<PresignUploadResponse> {
  const headers = await getAuthHeaders();
  const url = `${MEDIA_API_URL}/media/presignUpload`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to presign upload: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Upload file directly to storage using presigned URL
 */
export async function uploadFileToStorage(
  signedPutUrl: string,
  file: File,
  contentType: string,
  onProgress?: UploadProgressCallback
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Progress handler
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }

    // Load handler
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    // Error handler
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed due to network error'));
    });

    // Abort handler
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was aborted'));
    });

    // Open and send
    xhr.open('PUT', signedPutUrl);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.send(file);
  });
}

/**
 * Complete upload flow: presign + upload
 */
export async function uploadMedia(
  file: File,
  options: Omit<PresignUploadOptions, 'contentType' | 'fileSizeBytes'>,
  onProgress?: UploadProgressCallback
): Promise<UploadMediaResult> {
  // Get presigned URL
  const presignResponse = await presignUpload({
    ...options,
    contentType: file.type,
    fileSizeBytes: file.size,
  });

  // Upload file
  await uploadFileToStorage(
    presignResponse.signedPutUrl,
    file,
    presignResponse.requiredHeaders['Content-Type'],
    onProgress
  );

  return {
    objectKey: presignResponse.objectKey,
    contentType: file.type,
    fileSizeBytes: file.size,
  };
}

/**
 * Get signed URL for reading/downloading media
 */
export async function getSignedReadUrl(
  familyId: string,
  objectKey: string
): Promise<string> {
  const headers = await getAuthHeaders();
  const url = `${MEDIA_API_URL}/media/signedRead`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ familyId, objectKey }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to get signed URL: ${response.statusText}`);
  }

  const data: SignedReadResponse = await response.json();
  return data.signedGetUrl;
}

/**
 * Media URL cache with TTL
 */
interface CacheEntry {
  url: string;
  expiresAt: number;
}

const urlCache = new Map<string, CacheEntry>();
const DEFAULT_CACHE_TTL = 55 * 1000; // 55 seconds (less than signed URL expiry)

/**
 * Get signed URL with caching
 */
export async function getCachedMediaUrl(
  familyId: string,
  objectKey: string,
  ttl = DEFAULT_CACHE_TTL
): Promise<string> {
  const cacheKey = objectKey;
  const now = Date.now();
  const cached = urlCache.get(cacheKey);

  // Return cached URL if not expired
  if (cached && cached.expiresAt > now) {
    return cached.url;
  }

  // Fetch new URL
  const url = await getSignedReadUrl(familyId, objectKey);

  // Cache it
  urlCache.set(cacheKey, {
    url,
    expiresAt: now + ttl,
  });

  return url;
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCacheEntries(): void {
  const now = Date.now();
  for (const [key, entry] of urlCache.entries()) {
    if (entry.expiresAt <= now) {
      urlCache.delete(key);
    }
  }
}

/**
 * Clear all cache entries
 */
export function clearMediaCache(): void {
  urlCache.clear();
}

/**
 * Prefetch multiple media URLs
 */
export async function prefetchMediaUrls(
  familyId: string,
  objectKeys: string[]
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  await Promise.all(
    objectKeys.map(async (objectKey) => {
      try {
        const url = await getCachedMediaUrl(familyId, objectKey);
        results.set(objectKey, url);
      } catch (error) {
        console.error(`Failed to prefetch URL for ${objectKey}:`, error);
      }
    })
  );

  return results;
}

/**
 * Health check for Media API
 */
export async function checkMediaApiHealth(): Promise<boolean> {
  try {
    const url = `${MEDIA_API_URL}/health`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}
