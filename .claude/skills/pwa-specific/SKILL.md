---
name: pwa-specific
description: Domain-specific patterns for TimeHut PWA. Use when working with age calculation, WHO growth data, media upload flow, email link authentication, time capsules, and family membership.
---

# TimeHut PWA Domain-Specific Patterns

## When to Use

Use this skill when:
- Implementing age calculation logic
- Working with WHO growth percentile data
- Handling media upload flow (presign → upload → create document → display)
- Setting up Firebase email link authentication
- Creating time capsule functionality
- Implementing family membership and roles
- Working with baby profile data

## Age Calculation

### Core Logic

**Display format based on baby's age:**
- **< 24 months**: "X months Y days"
- **>= 24 months**: "X years Y months"

### Implementation

```typescript
import { differenceInMonths, differenceInDays } from 'date-fns';

interface AgeResult {
  display: string;        // "5 months 12 days" or "2 years 3 months"
  months: number;         // Total months
  years: number;          // Full years (0 if <24mo)
  monthsInYear: number;    // Months after years
  days: number;           // Remaining days
}

export function calculateAge(dob: string, dateTaken: string): AgeResult {
  const dobDate = new Date(dob);
  const takenDate = new Date(dateTaken);

  // Calculate total months and days
  const totalMonths = differenceInMonths(takenDate, dobDate);
  const totalDays = differenceInDays(takenDate, dobDate);

  if (totalMonths < 24) {
    // Less than 2 years: show months + days
    const years = 0;
    const monthsInYear = totalMonths;
    const days = totalDays - (monthsInYear * 30);

    return {
      display: `${monthsInYear} months ${days} days`,
      months: totalMonths,
      years,
      monthsInYear,
      days,
    };
  } else {
    // 2+ years: show years + months
    const years = Math.floor(totalMonths / 12);
    const monthsInYear = totalMonths % 12;
    const days = 0;

    return {
      display: `${years} years ${monthsInYear} months`,
      months: totalMonths,
      years,
      monthsInYear,
      days,
    };
  }
}
```

### Usage in Components

```typescript
import { calculateAge } from '@/lib/utils/age';

const MomentCard = ({ moment, babyDob }: Props) => {
  const age = calculateAge(babyDob, moment.dateTaken);

  return (
    <div>
      <p>{age.display}</p>
    </div>
  );
};
```

### i18n Integration

```typescript
import { useTranslation } from 'react-i18next';

const AgeDisplay = ({ dob, dateTaken }: Props) => {
  const { t } = useTranslation();
  const age = calculateAge(dob, dateTaken);

  // Translation keys: 'age.months_days', 'age.years_months'
  if (age.years === 0) {
    return (
      <span>
        {t('age.months_days', { months: age.monthsInYear, days: age.days })}
      </span>
    );
  }

  return (
    <span>
      {t('age.years_months', { years: age.years, months: age.monthsInYear })}
    </span>
  );
};
```

## WHO Growth Data

### Data Structure

**Location:** `src/lib/data/who-growth-data.ts`

```typescript
interface WHOGrowthData {
  // For each month (0-36)
  boys: {
    weight: WeightPercentiles;
    length: LengthPercentiles;
    headCircumference: HeadPercentiles;
  };
  girls: {
    weight: WeightPercentiles;
    length: LengthPercentiles;
    headCircumference: HeadPercentiles;
  };
}

interface WeightPercentiles {
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
}

interface LengthPercentiles {
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
}

interface HeadPercentiles {
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
}
```

### Usage

```typescript
import whoGrowthData from '@/lib/data/who-growth-data';

const GrowthChart = ({ babyDob, babyGender, weight, length }: Props) => {
  const ageMonths = calculateAge(babyDob, new Date().toISOString()).months;

  if (ageMonths < 0 || ageMonths > 36) {
    return <div>No WHO data available</div>;
  }

  // Get appropriate data
  const genderData = babyGender === 'male' ? whoGrowthData.boys : whoGrowthData.girls;
  const monthData = genderData[ageMonths];

  // Compare against percentiles
  const weightPercentile = calculatePercentile(weight, monthData.weight);
  const lengthPercentile = calculatePercentile(length, monthData.length);

  return (
    <div>
      <p>Weight: {weightPercentile}th percentile</p>
      <p>Length: {lengthPercentile}th percentile</p>
    </div>
  );
};

function calculatePercentile(value: number, percentiles: WeightPercentiles | LengthPercentiles): number {
  if (value <= percentiles.p3) return 3;
  if (value <= percentiles.p15) return 15;
  if (value <= percentiles.p50) return 50;
  if (value <= percentiles.p85) return 85;
  return 97;
}
```

## Media Upload Flow

### Architecture

**Complete Flow:**

1. **Client**: Request presigned URL from Media API
2. **Media API**: Validate Firebase auth + family membership → Return presigned PUT URL
3. **Client**: Upload file directly to storage (R2/MinIO) using presigned URL
4. **Client**: Create Moment document in Firestore with `objectKey`
5. **Display**: Request signed read URL from Media API → Display media

### Presign Upload Request

```typescript
import { getAuthInstance, getIdToken } from '@/lib/firebase/auth';
import { getSignedPutUrl } from '@/lib/api/media';

async function uploadMedia(file: File, metadata: MediaMetadata) {
  // 1. Get presigned URL
  const auth = getAuthInstance();
  const idToken = await getIdToken(auth);

  const presignResponse = await getSignedPutUrl({
    familyId: currentFamilyId,
    babyId: currentBabyId,
    contentType: file.type,
    fileSizeBytes: file.size,
    mediaType: metadata.mediaType,
    originalFilename: file.name,
    uploadId: uploadId, // Unique ID for tracking
  }, idToken);

  // 2. Upload to storage
  await uploadToStorage(presignResponse.signedPutUrl, file, presignResponse.requiredHeaders);

  // 3. Create document in Firestore
  const moment: MomentDocument = {
    id: momentId,
    babyId: currentBabyId,
    dateTaken: new Date().toISOString(),
    mediaType: metadata.mediaType,
    objectKey: presignResponse.objectKey,
    caption: metadata.caption,
    createdAt: new Date().toISOString(),
  };

  await createMoment(familyId, babyId, moment);
}
```

### Upload to Storage

```typescript
async function uploadToStorage(
  signedUrl: string,
  file: File,
  headers: Record<string, string>
): Promise<void> {
  const response = await fetch(signedUrl, {
    method: 'PUT',
    headers,
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }
}
```

### Progress Tracking

```typescript
import axios from 'axios'; // For upload progress

async function uploadWithProgress(
  signedUrl: string,
  file: File,
  headers: Record<string, string>,
  onProgress: (progress: number) => void
): Promise<void> {
  return axios.put(signedUrl, file, {
    headers,
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress(percentCompleted);
    },
  });
}

// Usage
await uploadWithProgress(presignResponse.signedPutUrl, file, headers, (progress) => {
  setUploadProgress(progress); // Update UI state
});
```

### Create Moment Document

```typescript
import { getFirestoreInstance } from '@/lib/firebase/config';
import { addDoc, collection, doc } from 'firebase/firestore';

async function createMoment(
  familyId: string,
  babyId: string,
  moment: Omit<MomentDocument, 'id'>
): Promise<string> {
  const db = getFirestoreInstance();

  // Reference: families/{familyId}/babies/{babyId}/moments/{momentId}
  const momentRef = doc(
    collection(db, 'families', familyId),
    'babies',
    babyId,
    'moments',
    moment.id
  );

  await setDoc(momentRef, {
    ...moment,
    createdAt: new Date().toISOString(),
  });

  return moment.id;
}
```

## Media Caching

### Implementation

**Location:** `src/lib/api/media.ts`

```typescript
// In-memory cache for signed URLs
const urlCache = new Map<string, { url: string; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCachedMediaUrl(familyId: string, objectKey: string): Promise<string> {
  const cacheKey = `${familyId}:${objectKey}`;
  const cached = urlCache.get(cacheKey);
  const now = Date.now();

  // Return cached URL if not expired
  if (cached && cached.expiresAt > now) {
    return cached.url;
  }

  // Fetch new URL
  const url = await getSignedReadUrl(familyId, objectKey);

  // Cache it
  urlCache.set(cacheKey, {
    url,
    expiresAt: now + CACHE_TTL,
  });

  return url;
}

// Cache invalidation
export function clearMediaCache(): void {
  urlCache.clear();
}

// Cleanup expired entries
export function clearExpiredCacheEntries(): void {
  const now = Date.now();
  for (const [key, entry] of urlCache.entries()) {
    if (entry.expiresAt <= now) {
      urlCache.delete(key);
    }
  }
}
```

### Usage

```typescript
const MediaCard = ({ familyId, objectKey }: Props) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch URL (cached if available)
    getCachedMediaUrl(familyId, objectKey).then(setUrl);
  }, [familyId, objectKey]);

  if (!url) return <Spinner />;

  return (
    <img src={url} alt="Moment" loading="lazy" />
  );
};
```

### Prefetch Multiple URLs

```typescript
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

// Usage in TimelinePage
useEffect(() => {
  if (moments.length > 0) {
    const objectKeys = moments.map(m => m.objectKey);
    prefetchMediaUrls(familyId, objectKeys);
  }
}, [moments]);
```

## Firebase Email Link Authentication

### Flow

1. User enters email
2. User clicks "Send Magic Link"
3. Firebase sends email with sign-in link
4. User clicks link in email
5. Firebase authenticates user automatically
6. User is signed in

### Implementation

```typescript
import {
  getAuthInstance,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from '@/lib/firebase/auth';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuthInstance();

  // 1. Handle email link (when user clicks link in email)
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      // Sign in with email link
      signInWithEmailLink(auth, window.location.href)
        .then(() => {
          // Redirect to timeline
          window.location.href = '/timeline';
        })
        .catch((err) => {
          setError('Failed to sign in: ' + err.message);
        });
    }
  }, []);

  // 2. Send magic link
  const handleSendLink = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const actionCodeSettings = {
        url: window.location.href, // URL to redirect after sign-in
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);

      // Show success message
      // Email sent successfully
    } catch (error: any) {
      setError(error.message || 'Failed to send magic link');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault(); handleSendLink();}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button type="submit" disabled={isSending}>
        {isSending ? 'Sending...' : 'Send Magic Link'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

### Test Account (Local Development)

```typescript
const AuthPage = () => {
  const handleTestAccount = async () => {
    const auth = getAuthInstance();

    try {
      // Sign in anonymously for local testing
      const user = await signInAnonymously(auth);

      console.log('Test user signed in:', user);
    } catch (error) {
      console.error('Failed to sign in test user:', error);
    }
  };

  return (
    <div>
      <form>{/* Email form */}</form>
      <button onClick={handleTestAccount}>
        Test Account (Local Only)
      </button>
    </div>
  );
};
```

## Time Capsules

### Data Structure

```typescript
interface CapsuleDocument {
  id: string;
  familyId: string;
  babyId?: string;
  title: string;
  message?: string;
  mediaKeys: string[]; // Array of object keys
  unlockDate: string; // ISO timestamp
  createdBy: string; // User UID
  createdAt: string;
  status: 'locked' | 'unlocked';
}
```

### Create Capsule

```typescript
import { getFirestoreInstance } from '@/lib/firebase/config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

async function createCapsule(
  familyId: string,
  capsule: Omit<CapsuleDocument, 'id' | 'createdAt'>
): Promise<string> {
  const db = getFirestoreInstance();

  const capsuleRef = doc(collection(db, 'families', familyId), 'capsules', capsule.id);

  await setDoc(capsuleRef, {
    ...capsule,
    createdAt: serverTimestamp(),
    status: 'locked',
  });

  return capsule.id;
}

// Usage
const handleCreateCapsule = async () => {
  const capsule: Omit<CapsuleDocument, 'id' | 'createdAt'> = {
    id: `capsule-${Date.now()}`,
    familyId: currentFamilyId,
    babyId: currentBabyId,
    title: 'Baby\'s First Birthday',
    message: 'Opening this on your first birthday!',
    mediaKeys: selectedMoments.map(m => m.objectKey),
    unlockDate: new Date('2026-12-25').toISOString(), // Future date
    createdBy: currentUser.uid,
  };

  await createCapsule(familyId, capsule);
};
```

### Check Unlock Status

```typescript
async function getCapsule(familyId: string, capsuleId: string): Promise<CapsuleDocument | null> {
  const db = getFirestoreInstance();
  const capsuleRef = doc(db, 'families', familyId, 'capsules', capsuleId);

  const snapshot = await getDoc(capsuleRef);

  if (!snapshot.exists()) {
    return null;
  }

  const capsule = snapshot.data() as CapsuleDocument;
  const now = new Date();

  // Check if unlocked
  if (new Date(capsule.unlockDate) <= now) {
    // Unlock status
    await updateDoc(capsuleRef, { status: 'unlocked' });
    capsule.status = 'unlocked';
  }

  return capsule;
}
```

### Display Capsule

```typescript
const CapsuleCard = ({ capsule }: Props) => {
  const { t } = useTranslation();
  const now = new Date();
  const isLocked = new Date(capsule.unlockDate) > now;

  if (isLocked) {
    // Show locked state
    const daysUntil = Math.ceil(
      (new Date(capsule.unlockDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
      <div className="locked">
        <h2>{capsule.title}</h2>
        <p>{t('capsule.unlockIn', { days: daysUntil })}</p>
        <div className="lock-icon">🔒</div>
      </div>
    );
  }

  // Show unlocked content
  return (
    <div className="unlocked">
      <h2>{capsule.title}</h2>
      {capsule.message && <p>{capsule.message}</p>}
      <div className="media-grid">
        {capsule.mediaKeys.map(key => (
          <MediaCard key={key} objectKey={key} />
        ))}
      </div>
    </div>
  );
};
```

## Family Membership

### Data Structure

```typescript
interface FamilyDocument {
  id: string;
  name: string;
  createdAt: string;
  members: Record<string, FamilyMember>; // UID → Member object
  settings: FamilySettings;
}

interface FamilyMember {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: string;
}
```

### Role-Based Access

```typescript
// Check if user is admin
const isAdmin = (family: FamilyDocument, uid: string): boolean => {
  const member = family.members[uid];
  return member?.role === 'admin';
};

// Check if user can edit
const canEdit = (family: FamilyDocument, uid: string): boolean => {
  const member = family.members[uid];
  return member?.role === 'admin' || member?.role === 'editor';
};

// Check if user is member
const isMember = (family: FamilyDocument, uid: string): boolean => {
  return uid in family.members;
};
```

### Membership Validation

```typescript
// In Media API (for validation)
async function validateFamilyMembership(
  familyId: string,
  uid: string
): Promise<boolean> {
  const db = getFirestoreInstance();
  const familyRef = doc(db, 'families', familyId);

  const snapshot = await getDoc(familyRef);

  if (!snapshot.exists()) {
    return false;
  }

  const family = snapshot.data() as FamilyDocument;
  return isMember(family, uid);
}

// Usage in upload presign endpoint
export async function getSignedPutUrl(
  options: PresignUploadOptions,
  idToken: string
): Promise<PresignUploadResponse> {
  // Validate token and family membership
  const authResult = await verifyFirebaseToken(idToken);
  if (!authResult.uid) {
    throw new Error('Invalid token');
  }

  const isMember = await validateFamilyMembership(options.familyId, authResult.uid);
  if (!isMember) {
    throw new Error('Not a member of this family');
  }

  // Proceed with presigned URL generation...
}
```

### Member Management

```typescript
// Add family member (admin only)
async function addFamilyMember(
  familyId: string,
  memberEmail: string,
  role: 'editor' | 'viewer'
): Promise<void> {
  const db = getFirestoreInstance();
  const familyRef = doc(db, 'families', familyId);

  await updateDoc(familyRef, {
    [`members.${memberUid}`]: {
      uid: memberUid,
      email: memberEmail,
      role,
      joinedAt: new Date().toISOString(),
    },
  });
}

// Remove family member (admin only)
async function removeFamilyMember(
  familyId: string,
  memberUid: string
): Promise<void> {
  const db = getFirestoreInstance();
  const familyRef = doc(db, 'families', familyId);

  await updateDoc(familyRef, {
    [`members.${memberUid}`]: deleteField(),
  });
}
```

## Baby Profile

### Create Baby

```typescript
import { getFirestoreInstance } from '@/lib/firebase/config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

async function createBaby(
  familyId: string,
  baby: Omit<BabyDocument, 'id' | 'createdAt'>
): Promise<string> {
  const db = getFirestoreInstance();

  const babyRef = doc(collection(db, 'families', familyId), 'babies', baby.id);

  await setDoc(babyRef, {
    ...baby,
    createdAt: serverTimestamp(),
  });

  return baby.id;
}

// Usage
const handleCreateBaby = async () => {
  const baby: Omit<BabyDocument, 'id' | 'createdAt'> = {
    id: `baby-${Date.now()}`,
    name: babyName.trim(),
    dob: babyDob, // ISO timestamp
    gender: babyGender, // 'male' | 'female'
  };

  const babyId = await createBaby(familyId, baby);

  // Update store
  reloadBabies();
};
```

### Update Baby Profile

```typescript
async function updateBaby(
  familyId: string,
  babyId: string,
  updates: Partial<Omit<BabyDocument, 'id' | 'createdAt'>>
): Promise<void> {
  const db = getFirestoreInstance();
  const babyRef = doc(db, 'families', familyId, 'babies', babyId);

  await updateDoc(babyRef, updates);

  // Update local store
  setBabies(babies.map(b =>
    b.id === babyId ? { ...b, ...updates } : b
  ));
}

// Usage
const handleUpdateProfile = async (updates: { name?: string }) => {
  await updateBaby(familyId, babyId, updates);

  // Show success message
  console.log('Profile updated');
};
```

## Storage Configuration

### Production (Cloudflare R2)

```typescript
const R2_CONFIG = {
  accountId: import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID,
  apiKey: import.meta.env.VITE_CLOUDFLARE_API_TOKEN,
  bucket: import.meta.env.VITE_R2_BUCKET_NAME,
};

// Media API (Cloudflare Worker) endpoint
const MEDIA_API_URL = import.meta.env.VITE_MEDIA_API_URL;
```

### Development (MinIO)

```typescript
// Local development uses MinIO
const MINIO_CONFIG = {
  endpoint: 'http://localhost:9000',
  accessKey: 'minioadmin',
  secretKey: 'minioadmin123',
  bucket: 'timehut-dev',
};

// Media API (Node.js) endpoint
const MEDIA_API_URL = import.meta.env.VITE_MEDIA_API_URL || 'http://localhost:8787';
```

## Key Patterns Summary

### ✅ DO:
- Use presigned URLs for direct upload (don't proxy through API)
- Cache signed read URLs with TTL (5 minutes)
- Validate family membership before allowing operations
- Use proper TypeScript types for all documents
- Include `createdAt` timestamps using `serverTimestamp()`
- Handle age calculation correctly (<24mo vs >=24mo)
- Use WHO percentile data for 0-36 months only
- Lock time capsules until unlock date

### ❌ DON'T:
- Upload files through Media API (use direct upload to storage)
- Forget to validate Firebase tokens
- Cache URLs indefinitely (use TTL)
- Allow non-members to access family data
- Hardcode age calculation rules (use shared function)
- Mix up WHO data structure (boys vs girls)
- Unlock time capsules before unlock date

## Related Skills

- `react-typescript` - React/TypeScript patterns
- `testing` - Testing patterns for these features
- `firebase` - Firebase integration patterns
- `i18n` - i18n integration for all features
