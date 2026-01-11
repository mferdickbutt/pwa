# TimeHut PWA

A private family baby memory book Progressive Web App.

## Features

- **Timeline Feed** - Photo/video timeline with accurate baby age at each moment
- **Calendar View** - Monthly calendar showing moments by date
- **Growth Tracker** - Charts baby's growth against WHO percentile standards
- **Time Capsules** - Create capsules that unlock on future dates
- **Baby Profile** - Track milestones and view baby info

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Firebase Auth + Cloud Firestore
- **Storage**: Cloudflare R2 (prod) / MinIO (local)
- **Media API**: Cloudflare Worker (prod) / Node.js (local)

## Local Development

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm 9+

### 1. Clone and Install

```bash
cd /Users/codercedric/timehut-pwa
npm install
```

### 2. Start MinIO (Object Storage)

```bash
docker-compose up -d
```

MinIO will be available at:
- API: http://localhost:9000
- Console: http://localhost:9001 (minioadmin / minioadmin123)

### 3. Start Firebase Emulators

```bash
cd firebase
firebase emulators:start
```

Or install globally and run:
```bash
npm install -g firebase-tools
firebase emulators:start --project timehut-local
```

Services:
- Firestore: http://localhost:8080
- Auth: http://localhost:9099
- UI: http://localhost:4000

### 4. Start Media API

The Media API handles presigned URLs for secure media upload/download.

```bash
cd packages/media-api
npm run dev
```

The API will be available at http://localhost:8787

### 5. Start Frontend

```bash
cd packages/frontend
npm run dev
```

The app will be available at http://localhost:3000

## Creating a Test Family

1. Open the app at http://localhost:3000
2. Click "Continue with Test Account (Emulator)"
3. This will create:
   - A test family with your user as admin
   - A test baby (6 months old)

## Project Structure

```
timehut-pwa/
├── packages/
│   ├── frontend/          # React + Vite PWA
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   │   ├── firebase/    # Firebase config & helpers
│   │   │   │   ├── api/         # Media API client
│   │   │   │   ├── utils/       # Utilities (age, calendar, etc)
│   │   │   │   └── data/        # WHO growth data
│   │   │   ├── stores/          # Zustand state management
│   │   │   ├── pages/           # Page components
│   │   │   └── types/           # TypeScript types
│   │   └── public/
│   ├── media-api/         # Cloudflare Worker (Media API)
│   └── firebase/          # Firestore rules & indexes
├── docker-compose.yml     # MinIO configuration
└── firebase/
    ├── firestore.rules    # Security rules
    └── firestore.indexes.json
```

## Environment Variables

### Frontend (`.env.development`)

```bash
VITE_USE_EMULATORS=true
VITE_MEDIA_API_URL=http://localhost:8787
VITE_FIREBASE_PROJECT_ID=timehut-local
```

### Media API

Set via environment or `.env`:
```bash
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=timehut-local
FIREBASE_PROJECT_ID=timehut-local
FIRESTORE_EMULATOR_HOST=localhost:8080
```

## Firestore Security Rules

The security rules enforce:
- Auth required for all operations
- Family membership validation
- Admin-only writes (except comments)
- Comments: any family member can add

See `firebase/firestore.rules` for details.

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Type check
npm run type-check

# Lint
npm run lint
```

## Building for Production

```bash
npm run build
```

Build artifacts will be in `packages/frontend/dist/`

## Deploying

### Media API (Cloudflare Workers)

```bash
cd packages/media-api
wrangler deploy
```

### Frontend (Cloudflare Pages / Vercel / Netlify)

1. Set production environment variables
2. Deploy the `packages/frontend/dist` folder

## Implementation Notes

### Email Link Authentication

The app uses Firebase email link authentication (passwordless):
- User enters email
- Receives a magic link
- Clicking the link signs them in

For local testing with emulators, use the "Test Account" button which signs in anonymously.

### Age Calculation

Age is calculated based on:
- Baby's date of birth (DOB)
- Moment's `dateTaken` timestamp

Display format:
- < 24 months: "X months Y days"
- >= 24 months: "X years Y months"

### WHO Growth Data

Complete WHO percentile data (0-36 months) is bundled in `src/lib/data/who-growth-data.ts`:
- Weight-for-age
- Length/height-for-age
- Head circumference-for-age

Percentiles: 3rd, 15th, 50th, 85th, 97th

### Media Storage Flow

1. Client calls `POST /media/presignUpload` with metadata
2. Media API validates auth + family membership
3. Returns signed PUT URL
4. Client uploads file directly to storage
5. Client creates Moment document with `objectKey`
6. Display: `POST /media/signedRead` returns short-lived GET URL

## Future Enhancements (v2)

1. **Milestones in Firestore** - Currently static, will move to subcollection
2. **Full local-first sync** - Outbox pattern with conflict resolution
3. **Server-side media processing** - Image resizing, transcoding
4. **Multi-device deduplication** - Hash-based media detection

## License

MIT
