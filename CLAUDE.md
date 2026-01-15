# TimeHut PWA - Baby Memory Book

## Quick Facts
- **Language**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Backend**: Firebase (Auth, Firestore)
- **Storage**: Cloudflare R2 (prod) / MinIO (local)
- **i18n**: react-i18next (English, Traditional Chinese)
- **Media API**: Cloudflare Worker (prod) / Node.js (local)
- **Routing**: react-router-dom

## Project Structure

### Monorepo Layout
```
pwa/
├── packages/
│   ├── frontend/                 # React + Vite frontend
│   │   ├── src/
│   │   │   ├── components/      # Reusable components
│   │   │   ├── pages/          # Page components
│   │   │   ├── stores/         # Zustand stores
│   │   │   ├── lib/            # Utilities and API clients
│   │   │   │   ├── firebase/   # Firebase config & operations
│   │   │   │   ├── api/        # Media API client
│   │   │   │   ├── data/       # Static data (WHO growth)
│   │   │   │   ├── i18n/       # i18n configuration
│   │   │   │   └── utils/      # Helper functions
│   │   │   ├── types/          # TypeScript types
│   │   │   └── locales/        # Translation files
│   │   ├── public/               # Static assets
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── media-api/                # Media API server
│       ├── src/
│       │   ├── handlers/          # Cloudflare Worker handlers
│       │   └── routes/            # API routes
│       └── package.json
├── firebase/                     # Firebase configuration
│   ├── firebase.json
│   └── firestore.indexes.json
├── docker-compose.yml             # MinIO for local dev
├── package.json                 # Root workspace config
├── vercel.json                 # Vercel deployment config
└── README.md
```

## Key Commands

### Root Package Scripts
```bash
# Development (starts both frontend and API)
npm run dev

# Build both packages
npm run build

# Run tests
npm run test

# Run ESLint
npm run lint

# Type-check TypeScript
npm run type-check
```

### Frontend Scripts
```bash
cd packages/frontend

# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Type-check
npm run type-check

# Lint
npm run lint
```

### Media API Scripts
```bash
cd packages/media-api

# Development
npm run dev

# Build
npm run build

# Test
npm run test
```

### Firebase Emulators
```bash
cd firebase
firebase emulators:start

# Or using global firebase-tools
firebase emulators:start --project timehut-local
```

### Docker (MinIO)
```bash
docker-compose up -d

# MinIO Console: http://localhost:9001 (minioadmin / minioadmin123)
# MinIO API: http://localhost:9000
```

## Firebase Configuration

### Authentication
- **Type**: Email link authentication (passwordless)
- **Flow**: User enters email → Receives magic link → Signs in
- **Local Testing**: Use "Test Account" button for anonymous auth

### Firestore
- **Database**: Cloud Firestore
- **Collections**:
  - `families` - Family documents with members and settings
  - `babies` - Baby profiles linked to families
  - `moments` - Timeline moments with media references
  - `capsules` - Time capsules with unlock dates
  - `milestones` - Baby milestones (will move to subcollection)

### Security Rules
- Family-based access control
- Members can only access their family's data
- Admin role for certain operations

## Tech Stack Details

### Frontend Framework
- **React 18+**: Component-based UI
- **TypeScript**: Strict mode enabled
- **Vite**: Fast build tool with HMR
- **Tailwind CSS**: Utility-first styling

### State Management (Zustand)
- **Stores**:
  - `authStore` - Authentication, families, babies
  - `momentStore` - Timeline moments, pagination
  - `capsuleStore` - Time capsules
  - `growthStore` - Growth tracking data

### Routing
- **React Router DOM**: Client-side routing
- **Lazy Loading**: Pages lazy-loaded with React.lazy
- **Protected Routes**: App wraps protected pages
- **Public Routes**: Auth page is public

### Animations
- **Framer Motion**: Page transitions and animations
- **Variants**: `initial`, `enter`, `exit` states
- **Transitions**: Tween with ease "anticipate", 0.4s duration

### i18n
- **react-i18next**: Internationalization
- **Languages**: English (en), Traditional Chinese (zh-TW)
- **Translation Files**: `src/locales/en.json`, `src/locales/zh-TW.json`
- **Hook**: `useTranslation()` for components

## Key Features

### Timeline
- **Display**: Photo/video timeline with baby's age at each moment
- **Age Calculation**: Based on DOB and `dateTaken` timestamp
- **Format**:
  - <24 months: "X months Y days"
  - >=24 months: "X years Y months"
- **Lazy Loading**: Infinite scroll pagination

### Calendar View
- **Monthly calendar** showing moments by date
- **Navigation**: Month-based navigation

### Growth Tracker
- **WHO Percentiles**: 0-36 months
- **Data Bundled**: Complete WHO growth data in `src/lib/data/who-growth-data.ts`
- **Metrics**:
  - Weight-for-age
  - Length/height-for-age
  - Head circumference-for-age
- **Percentiles**: 3rd, 15th, 50th, 85th, 97th

### Time Capsules
- **Create**: Set future unlock date
- **Lock**: Cannot view until unlock date
- **Content**: Photos, videos, messages

### Baby Profile
- **Milestones**: Track developmental milestones
- **Settings**: Theme, language, etc.
- **Multiple Babies**: Support for multiple babies per family

## Media Upload Flow

### Architecture
1. **Presign Request**: Client calls `POST /media/presignUpload` with metadata
2. **Validation**: Media API validates Firebase auth + family membership
3. **Return**: Signed PUT URL for direct upload to storage
4. **Upload**: Client uploads file directly to R2/MinIO using presigned URL
5. **Create Document**: Client creates Moment document with `objectKey`
6. **Display**: Client calls `POST /media/signedRead` to get short-lived GET URL

### Storage
- **Production**: Cloudflare R2 (S3-compatible)
- **Development**: MinIO (local S3-compatible)
- **Presigned URLs**: Short-lived (5-15 min TTL)
- **Caching**: Frontend caches URLs with TTL

### Security
- **Auth Required**: All Media API calls require Firebase auth token
- **Family Validation**: API validates user is member of family
- **Content Type**: Validated against allowed types
- **File Size**: Size limits enforced

## Code Style Guidelines

### Component Structure
```typescript
// Page components
const PageComponent = () => {
  // 1. Hooks first
  const { t } = useTranslation();
  const { user, currentFamily } = useAuthStore();

  // 2. State
  const [localState, setLocalState] = useState();

  // 3. Effects
  useEffect(() => {
    // Side effects
  }, []);

  // 4. Handlers
  const handleClick = () => {
    // Event handlers
  };

  // 5. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default PageComponent;
```

### TypeScript Patterns
- **Strict Mode**: Enabled in tsconfig.json
- **Type Imports**: Use `import type { Type }` for type-only imports
- **Interfaces**: For Firestore documents and API contracts
- **Types**: For unions and complex types
- **Path Aliases**: `@/*` → `./src/*`

### Tailwind CSS
- **Utility-first**: No custom CSS files (except global)
- **Responsive**: Mobile-first approach
- **Dark Mode**: Support for theme switching
- **Animation**: Use Framer Motion, not CSS transitions

### Zustand Stores
```typescript
interface StoreState {
  // State
  data: Type[];
  isLoading: boolean;

  // Actions
  fetchData: () => Promise<void>;
  updateData: (id: string, updates: Partial<Type>) => void;
  reset: () => void;
}

const useStore = create<StoreState>((set) => ({
  // Initial state
  data: [],
  isLoading: false,

  // Actions
  fetchData: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchData();
      set({ data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  // Reset
  reset: () => set(initialState),
}));
```

## Important Notes

### Age Calculation Logic
- **Basis**: Baby's date of birth (DOB) + Moment's `dateTaken` timestamp
- **Display Rules**:
  - < 24 months: "X months Y days"
  - >= 24 months: "X years Y months"
- **Storage**: `dateTaken` is ISO timestamp string

### WHO Growth Data
- **Source**: World Health Organization
- **Bundle**: Complete dataset (0-36 months)
- **Location**: `src/lib/data/who-growth-data.ts`
- **Percentiles**: 3, 15, 50, 85, 97

### Authentication
- **Passwordless**: Email link only (no passwords)
- **Local Testing**: Use "Test Account" button for anonymous auth
- **Emulators**: Use Firebase Auth emulator for local development

### Media Caching
- **Implementation**: In-memory Map in `lib/api/media.ts`
- **TTL**: 5 minutes default
- **Expiration**: Automatic cleanup of expired entries
- **Manual Clear**: `clearMediaCache()` function available

## Testing

### Current Status
- **No Testing Framework**: Currently no test files or configuration
- **Plan**: Use Vitest + React Testing Library

### Recommended Stack
- **Vitest**: Fast native Vite testing
- **React Testing Library**: Component testing
- **MSW**: API mocking for Media API
- **Firebase Emulators**: Firebase integration testing

## Deployment

### Frontend
- **Platform**: Vercel / Cloudflare Pages / Netlify
- **Build Output**: `packages/frontend/dist`
- **Environment Variables**: Set in platform
- **SPA**: Single page app with client-side routing

### Media API
- **Platform**: Cloudflare Workers (prod)
- **Local**: Node.js with MinIO
- **Deploy**: Wrangler CLI
- **Environment**: Cloudflare env vars

### Firebase
- **Firestore**: Cloud Firestore
- **Auth**: Firebase Auth
- **Emulators**: Local development
- **Deploy**: Firebase CLI

## Dependencies

### Core
- react, react-dom, react-router-dom
- zustand, framer-motion
- @vitejs/plugin-react, vite
- tailwindcss, postcss, autoprefixer

### Firebase
- firebase, @firebase/app, @firebase/auth, @firebase/firestore
- @firebase/storage

### i18n
- react-i18next, i18next, i18next-browser-languagedetector

### Dev Tools
- typescript, @types/react, @types/react-dom
- eslint, prettier
- vite, @vitejs/plugin-react
- wrangler (Cloudflare)

## Environment Variables

### Frontend (.env)
```bash
VITE_MEDIA_API_URL=http://localhost:8787  # Media API URL
VITE_FIREBASE_API_KEY=               # Firebase API key
VITE_FIREBASE_AUTH_DOMAIN=           # Firebase auth domain
VITE_FIREBASE_PROJECT_ID=            # Firebase project ID
VITE_FIREBASE_STORAGE_BUCKET=         # Firebase storage bucket
```

### Media API (.env)
```bash
CLOUDFLARE_ACCOUNT_ID=             # Cloudflare account ID
CLOUDFLARE_API_TOKEN=             # Cloudflare API token
R2_BUCKET_NAME=                   # R2 bucket name
FIREBASE_PROJECT_ID=               # Firebase project ID
```

## Common Workflows

### Adding a New Page
1. Create page component in `packages/frontend/src/pages/`
2. Add route in `App.tsx`
3. Use `ProtectedRoute` wrapper for authenticated pages
4. Use `AppShell` layout
5. Add navigation icon to `components/NavigationIcons.tsx`

### Adding a New Zustand Store
1. Create store in `packages/frontend/src/stores/`
2. Define state interface
3. Create with Zustand
4. Export hooks/actions
5. Import and use in components

### Adding Translation Keys
1. Edit `packages/frontend/src/locales/en.json`
2. Edit `packages/frontend/src/locales/zh-TW.json`
3. Use `useTranslation()` hook in component
4. Use `t('key')` to translate

### Testing Locally
1. Start MinIO: `docker-compose up -d`
2. Start Firebase Emulators: `firebase emulators:start`
3. Start Media API: `npm run dev:api`
4. Start Frontend: `npm run dev:frontend`
5. Open browser to `http://localhost:5173`

## Future Enhancements (v2)
1. Firestore subcollections for milestones
2. Full local-first sync with conflict resolution
3. Server-side media processing (resize, transcode)
4. Multi-device deduplication (hash-based)

## License
MIT
