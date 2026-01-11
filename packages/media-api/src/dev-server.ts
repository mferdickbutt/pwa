/**
 * Development server for Media API
 * This uses Node.js with MinIO instead of Cloudflare Workers
 * Run with: tsx src/dev-server.ts
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { createServer } from 'http';
import { URL } from 'url';

const PORT = parseInt(process.env.MEDIA_API_PORT || '8787', 10);
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin123';
const MINIO_BUCKET = process.env.MINIO_BUCKET || 'timehut-local';
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'timehut-local';

// Firebase Admin (connect to emulator)
const firebaseConfig = {
  credential: cert({
    projectId: FIREBASE_PROJECT_ID,
    // For emulator, we don't need real credentials
    clientEmail: 'firebase-adminsdk@fake.iam.gserviceaccount.com',
    privateKey: 'fake-key-for-emulator',
  }),
  projectId: FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to Firestore emulator
db.settings({
  host: process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080',
  ssl: false,
});

// Connect to Auth emulator
process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';

// S3 Client (MinIO)
const s3Client = new S3Client({
  endpoint: MINIO_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

// Helper: Verify Firebase ID token (emulator compatible)
async function verifyAuthToken(token: string): Promise<string> {
  try {
    // In emulator, tokens are just the UID for testing
    if (process.env.NODE_ENV === 'development' && token && !token.includes('.')) {
      // Treat non-JWT tokens as direct UID for emulator testing
      return token;
    }

    const decodedToken = await auth.verifyIdToken(token, true);
    return decodedToken.uid;
  } catch (error: any) {
    console.error('Token verification error:', error.message);
    // For emulator testing, allow fake tokens
    if (token.startsWith('test-uid-')) {
      return token;
    }
    throw new Error('Invalid or expired auth token');
  }
}

// Helper: Check if user is a family member
async function checkFamilyMembership(familyId: string, uid: string): Promise<boolean> {
  try {
    const memberRef = db.collection('families').doc(familyId).collection('members').doc(uid);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      return false;
    }

    const memberData = memberDoc.data();
    return memberData?.role === 'admin' || memberData?.role === 'viewer';
  } catch (error) {
    console.error('Family membership check error:', error);
    return false;
  }
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

// POST /media/presignUpload
async function handlePresignUpload(reqUrl: URL, body: any, authHeader: string | null): Promise<Response> {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing auth token');
  }

  const token = authHeader.substring(7);
  const uid = await verifyAuthToken(token);

  // Validate required fields
  if (!body.familyId || !body.babyId || !body.contentType || !body.mediaType) {
    throw new Error('Bad request: Missing required fields');
  }

  // Validate media type
  if (body.mediaType !== 'photo' && body.mediaType !== 'video') {
    throw new Error('Bad request: Invalid media type');
  }

  // Check family membership
  const isMember = await checkFamilyMembership(body.familyId, uid);
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

  // Generate object key
  const objectKey = generateObjectKey({
    familyId: body.familyId,
    babyId: body.babyId,
    mediaType: body.mediaType,
    uploadId: body.uploadId,
  });

  // Generate presigned PUT URL
  const command = new PutObjectCommand({
    Bucket: MINIO_BUCKET,
    Key: objectKey,
    ContentType: body.contentType,
  });

  const expiry = 900; // 15 minutes for uploads
  const signedPutUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expiry,
  });

  const expiresAt = new Date(Date.now() + expiry * 1000).toISOString();

  return Response.json({
    objectKey,
    signedPutUrl,
    requiredHeaders: {
      'Content-Type': body.contentType,
    },
    expiresAt,
  });
}

// POST /media/signedRead
async function handleSignedRead(reqUrl: URL, body: any, authHeader: string | null): Promise<Response> {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing auth token');
  }

  const token = authHeader.substring(7);
  const uid = await verifyAuthToken(token);

  // Validate required fields
  if (!body.familyId || !body.objectKey) {
    throw new Error('Bad request: Missing required fields');
  }

  // Check family membership
  const isMember = await checkFamilyMembership(body.familyId, uid);
  if (!isMember) {
    throw new Error('Forbidden: Not a family member');
  }

  // Validate object key belongs to the family
  if (!validateObjectKey(body.objectKey, body.familyId)) {
    throw new Error('Forbidden: Object key does not belong to this family');
  }

  // Generate presigned GET URL
  const command = new GetObjectCommand({
    Bucket: MINIO_BUCKET,
    Key: body.objectKey,
  });

  const expiry = 3600; // 1 hour for reads
  const signedGetUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expiry,
  });

  const expiresAt = new Date(Date.now() + expiry * 1000).toISOString();

  return Response.json({
    signedGetUrl,
    expiresAt,
  });
}

// Main request handler
async function handleRequest(req: any, res: any) {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    // Health check
    if (reqUrl.pathname === '/health' && req.method === 'GET') {
      res.statusCode = 200;
      res.end(JSON.stringify({
        status: 'ok',
        environment: 'development',
        timestamp: new Date().toISOString(),
      }));
      return;
    }

    // POST /media/presignUpload
    if (reqUrl.pathname === '/media/presignUpload' && req.method === 'POST') {
      const body = await new Promise<string>((resolve) => {
        let data = '';
        req.on('data', (chunk: any) => { data += chunk; });
        req.on('end', () => resolve(data));
      });
      const parsedBody = JSON.parse(body);
      const response = await handlePresignUpload(reqUrl, parsedBody, req.headers.authorization);
      res.statusCode = 200;
      res.end(JSON.stringify(await response.json()));
      return;
    }

    // POST /media/signedRead
    if (reqUrl.pathname === '/media/signedRead' && req.method === 'POST') {
      const body = await new Promise<string>((resolve) => {
        let data = '';
        req.on('data', (chunk: any) => { data += chunk; });
        req.on('end', () => resolve(data));
      });
      const parsedBody = JSON.parse(body);
      const response = await handleSignedRead(reqUrl, parsedBody, req.headers.authorization);
      res.statusCode = 200;
      res.end(JSON.stringify(await response.json()));
      return;
    }

    // 404
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));

  } catch (error: any) {
    console.error('Error:', error);
    const statusCode = error.message?.includes('Unauthorized') ? 401 :
                      error.message?.includes('Forbidden') ? 403 :
                      error.message?.includes('Bad request') ? 400 : 500;
    res.statusCode = statusCode;
    res.end(JSON.stringify({ error: error.message || 'Internal server error' }));
  }
}

// Create server
const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`Media API dev server running on http://localhost:${PORT}`);
  console.log(`Using MinIO at ${MINIO_ENDPOINT}`);
  console.log(`Firestore emulator: ${process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080'}`);
});
