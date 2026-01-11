/**
 * TimeHut Media API
 *
 * A Cloudflare Worker that generates presigned URLs for secure media upload/download.
 * Works with Cloudflare R2 in production and MinIO in local development.
 *
 * Environment variables:
 * - FIREBASE_SERVICE_ACCOUNT_KEY: Firebase service account JSON (base64 encoded)
 * - MINIO_ENDPOINT: MinIO endpoint (local dev only)
 * - MINIO_ACCESS_KEY: MinIO access key (local dev only)
 * - MINIO_SECRET_KEY: MinIO secret key (local dev only)
 * - MINIO_BUCKET: MinIO bucket name (local dev only)
 * - SIGNED_URL_EXPIRY_SECONDS: URL expiry time (default: 3600)
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Environment interface
interface Env {
  FIREBASE_SERVICE_ACCOUNT_KEY?: string;
  MINIO_ENDPOINT?: string;
  MINIO_ACCESS_KEY?: string;
  MINIO_SECRET_KEY?: string;
  MINIO_BUCKET?: string;
  SIGNED_URL_EXPIRY_SECONDS?: string;
  R2?: R2Bucket;
  ENVIRONMENT?: string;
}

// Firebase Admin initialization
let db: ReturnType<typeof getFirestore> | null = null;

function initializeFirebase(env: Env) {
  if (db) return db;

  if (!env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set');
  }

  // Decode base64 encoded service account key
  const serviceAccountKey = JSON.parse(
    atob(env.FIREBASE_SERVICE_ACCOUNT_KEY)
  );

  const existingApps = getApps();
  if (existingApps.length === 0) {
    initializeApp({
      credential: cert(serviceAccountKey),
    });
  }

  db = getFirestore();
  return db;
}

// S3 Client initialization (works with R2 and MinIO)
function createS3Client(env: Env): S3Client {
  const isDevelopment = env.ENVIRONMENT === 'development' || env.MINIO_ENDPOINT;

  if (isDevelopment) {
    // Use MinIO for local development
    return new S3Client({
      endpoint: env.MINIO_ENDPOINT || 'http://localhost:9000',
      region: 'us-east-1',
      credentials: {
        accessKeyId: env.MINIO_ACCESS_KEY || 'minioadmin',
        secretAccessKey: env.MINIO_SECRET_KEY || 'minioadmin123',
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  // Use R2 in production (binding is injected by Cloudflare)
  return new S3Client({
    region: 'auto',
    // @ts-ignore - R2 binding is provided by Cloudflare
    endpoint: `https://${env.R2?.endpoint || ''}`,
  });
}

// Get expiry seconds from env
function getExpirySeconds(env: Env): number {
  const defaultExpiry = 3600; // 1 hour
  const uploadExpiry = 900; // 15 minutes for uploads
  return {
    read: parseInt(env.SIGNED_URL_EXPIRY_SECONDS || String(defaultExpiry), 10),
    upload: uploadExpiry,
  };
}

// Helper: Verify Firebase ID token and extract UID
async function verifyAuthToken(token: string, env: Env): Promise<string> {
  try {
    const admin = await import('firebase-admin/auth');
    const decodedToken = await admin.getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    throw new Error('Invalid or expired auth token');
  }
}

// Helper: Check if user is a family member
async function checkFamilyMembership(familyId: string, uid: string, env: Env): Promise<boolean> {
  const db = initializeFirebase(env);
  const memberRef = db.collection('families').doc(familyId).collection('members').doc(uid);
  const memberDoc = await memberRef.get();

  if (!memberDoc.exists) {
    return false;
  }

  const memberData = memberDoc.data();
  return memberData?.role === 'admin' || memberData?.role === 'viewer';
}

// Helper: Generate object key
function generateObjectKey(params: {
  familyId: string;
  babyId: string;
  mediaType: string;
  uploadId?: string;
}): string {
  const { familyId, babyId, mediaType, uploadId } = params;
  const timestamp = Date.now();
  const random = uploadId || Math.random().toString(36).substring(2, 15);
  return `families/${familyId}/babies/${babyId}/moments/${timestamp}-${random}/original`;
}

// Helper: Validate object key belongs to family
function validateObjectKey(objectKey: string, familyId: string): boolean {
  const prefix = `families/${familyId}/`;
  return objectKey.startsWith(prefix);
}

// Helper: Get bucket name
function getBucketName(env: Env): string {
  return env.MINIO_BUCKET || 'timehut-local';
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Request interface
interface PresignUploadRequest {
  familyId: string;
  babyId: string;
  contentType: string;
  fileSizeBytes: number;
  mediaType: 'photo' | 'video';
  originalFilename?: string;
  uploadId?: string;
}

interface SignedReadRequest {
  familyId: string;
  objectKey: string;
}

// Main handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route: POST /media/presignUpload
      if (path === '/media/presignUpload' && request.method === 'POST') {
        return await handlePresignUpload(request, env);
      }

      // Route: POST /media/signedRead
      if (path === '/media/signedRead' && request.method === 'POST') {
        return await handleSignedRead(request, env);
      }

      // Health check
      if (path === '/health' && request.method === 'GET') {
        return Response.json({
          status: 'ok',
          environment: env.ENVIRONMENT || 'unknown',
          timestamp: new Date().toISOString(),
        }, { headers: corsHeaders });
      }

      // 404
      return new Response('Not found', {
        status: 404,
        headers: corsHeaders,
      });

    } catch (error: any) {
      console.error('Error:', error);
      return Response.json({
        error: error.message || 'Internal server error',
      }, {
        status: error.message?.includes('Unauthorized') ? 401 : 500,
        headers: corsHeaders,
      });
    }
  },
};

// POST /media/presignUpload
async function handlePresignUpload(request: Request, env: Env): Promise<Response> {
  // Verify auth token
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing auth token');
  }

  const token = authHeader.substring(7);
  const uid = await verifyAuthToken(token, env);

  // Parse request body
  const body = await request.json() as PresignUploadRequest;

  // Validate required fields
  if (!body.familyId || !body.babyId || !body.contentType || !body.mediaType) {
    throw new Error('Bad request: Missing required fields');
  }

  // Validate media type
  if (body.mediaType !== 'photo' && body.mediaType !== 'video') {
    throw new Error('Bad request: Invalid media type');
  }

  // Check family membership
  const isMember = await checkFamilyMembership(body.familyId, uid, env);
  if (!isMember) {
    throw new Error('Forbidden: Not a family member');
  }

  // Validate file size
  const maxPhotoSize = 25 * 1024 * 1024; // 25MB
  const maxVideoSize = 250 * 1024 * 1024; // 250MB
  const maxSize = body.mediaType === 'photo' ? maxPhotoSize : maxVideoSize;

  if (body.fileSizeBytes && body.fileSizeBytes > maxSize) {
    throw new Error(`Bad request: File too large (max ${maxSize / 1024 / 1024}MB)`);
  }

  // Validate content type
  const allowedPhotoTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic'];
  const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];

  if (body.mediaType === 'photo' && !allowedPhotoTypes.includes(body.contentType)) {
    throw new Error('Bad request: Invalid image type');
  }

  if (body.mediaType === 'video' && !allowedVideoTypes.includes(body.contentType)) {
    throw new Error('Bad request: Invalid video type');
  }

  // Generate object key
  const objectKey = generateObjectKey({
    familyId: body.familyId,
    babyId: body.babyId,
    mediaType: body.mediaType,
    uploadId: body.uploadId,
  });

  // Create S3 client
  const s3Client = createS3Client(env);

  // Generate presigned PUT URL
  const command = new PutObjectCommand({
    Bucket: getBucketName(env),
    Key: objectKey,
    ContentType: body.contentType,
  });

  const expiry = getExpirySeconds(env).upload;
  const signedPutUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expiry,
  });

  // Calculate expiry timestamp
  const expiresAt = new Date(Date.now() + expiry * 1000).toISOString();

  return Response.json({
    objectKey,
    signedPutUrl,
    requiredHeaders: {
      'Content-Type': body.contentType,
    },
    expiresAt,
  }, { headers: corsHeaders });
}

// POST /media/signedRead
async function handleSignedRead(request: Request, env: Env): Promise<Response> {
  // Verify auth token
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing auth token');
  }

  const token = authHeader.substring(7);
  const uid = await verifyAuthToken(token, env);

  // Parse request body
  const body = await request.json() as SignedReadRequest;

  // Validate required fields
  if (!body.familyId || !body.objectKey) {
    throw new Error('Bad request: Missing required fields');
  }

  // Check family membership
  const isMember = await checkFamilyMembership(body.familyId, uid, env);
  if (!isMember) {
    throw new Error('Forbidden: Not a family member');
  }

  // Validate object key belongs to the family
  if (!validateObjectKey(body.objectKey, body.familyId)) {
    throw new Error('Forbidden: Object key does not belong to this family');
  }

  // Create S3 client
  const s3Client = createS3Client(env);

  // Generate presigned GET URL
  const command = new GetObjectCommand({
    Bucket: getBucketName(env),
    Key: body.objectKey,
  });

  const expiry = getExpirySeconds(env).read;
  const signedGetUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expiry,
  });

  // Calculate expiry timestamp
  const expiresAt = new Date(Date.now() + expiry * 1000).toISOString();

  return Response.json({
    signedGetUrl,
    expiresAt,
  }, { headers: corsHeaders });
}
