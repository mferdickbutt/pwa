---
name: debugging
description: Debugging patterns for TimeHut PWA. Use when troubleshooting React components, Firebase integration, Media API, state management, or performance issues.
---

# Debugging Patterns for TimeHut PWA

## When to Use

Use this skill when:
- React components not rendering correctly
- State management issues (Zustand)
- Firebase authentication or Firestore problems
- Media API not working
- Performance issues (slow loads, laggy UI)
- i18n not translating
- Animations not working (Framer Motion)
- Network errors or API failures

## React DevTools

### Installing React DevTools

```bash
# Chrome/Edge
https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoieni

# Firefox
https://addons.mozilla.org/en-US/firefox/addon/react-devtools/
```

### Using React DevTools

**Component Inspection:**
```typescript
// Open DevTools → Components tab
// Inspect component props, state, and hooks
// View component tree

// In component
const MyComponent = () => {
  const [count, setCount] = useState(0);

  // DevTools shows:
  // - Props: MyComponent
  // - State: count: 0, setCount: fn
  // - Hooks: useState

  return <div>Count: {count}</div>;
};
```

**Time Travel Debugging:**
```typescript
// DevTools allows time travel
// Click on state values to restore previous state

useEffect(() => {
  console.log('Effect ran');
}, []);

// DevTools shows effect history
// Click on past state values to debug state changes
```

## Zustand DevTools

### Setting Up

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface StoreState {
  count: number;
  increment: () => void;
}

const useStore = create<StoreState>()(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set(state => ({ count: state.count + 1 })),
    }),
    { name: 'myStore' } // Store name for DevTools
  )
);

export default useStore;
```

### Using Zustand DevTools

```bash
# Install
npm install zustand

# In browser
# Open DevTools → Zustand tab
# View all stores, their state, and actions
# Time travel through state changes
```

**Benefits:**
- View all stores in one place
- See state change history
- Time travel debugging
- Track actions being dispatched
- Performance profiling

## Firebase Emulator UI

### Accessing Emulator UI

```bash
# Start emulators
cd firebase
firebase emulators:start

# Open UI in browser
http://localhost:4000
```

**Emulator UI Features:**

1. **Firestore Database** - View collections, documents
   - Add/edit/delete documents
   - View query results
   - Test security rules

2. **Authentication** - View users
   - Create test users
   - Sign in/out as test users
   - Test email link authentication

3. **Storage** - View stored files
   - Upload/download files
   - Test storage security rules

### Debugging Firestore Operations

```typescript
// Add logging to Firestore operations
import { getFirestoreInstance } from '@/lib/firebase/config';

async function createBaby(familyId: string, baby: Omit<BabyDocument, 'id' | 'createdAt'>) {
  const db = getFirestoreInstance();

  console.log('[Firestore] Creating baby:', { familyId, baby });

  try {
    const babyId = await addDoc(collection(db, 'families', familyId, 'babies'), {
      ...baby,
      createdAt: serverTimestamp(),
    });

    console.log('[Firestore] Baby created successfully:', babyId);
    return babyId;
  } catch (error) {
    console.error('[Firestore] Failed to create baby:', error);
    throw error;
  }
}
```

### Debugging Auth Flow

```typescript
import { onAuthStateChanged } from '@/lib/firebase/auth';
import { getAuthInstance } from '@/lib/firebase/config';

useEffect(() => {
  const auth = getAuthInstance();

  console.log('[Auth] Setting up auth listener...');

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log('[Auth] Auth state changed:', {
      uid: user?.uid || null,
      email: user?.email || null,
      isAuthenticated: !!user,
    });

    // Update state
    setUser(user);
  });

  return () => {
    console.log('[Auth] Cleaning up auth listener');
    unsubscribe();
  };
}, []);
```

## Media API Debugging

### Network Tab Debugging

```typescript
// In browser DevTools → Network tab
// Filter by "media" or "localhost:8787"
// View all Media API requests

// Look for:
// - Failed requests (red status codes)
// - Slow requests (>1s)
// - Malformed requests (400)
// - Auth errors (401)
```

### Presign URL Debugging

```typescript
async function uploadMedia(file: File, metadata: MediaMetadata) {
  console.log('[Media API] Requesting presigned URL:', {
    familyId: metadata.familyId,
    babyId: metadata.babyId,
    contentType: file.type,
    fileSizeBytes: file.size,
  });

  const presignResponse = await getSignedPutUrl(metadata);

  console.log('[Media API] Presigned URL received:', {
    objectKey: presignResponse.objectKey,
    signedPutUrl: presignResponse.signedPutUrl,
    requiredHeaders: presignResponse.requiredHeaders,
    expiresAt: presignResponse.expiresAt,
  });

  // Upload to storage
  await uploadToStorage(presignResponse.signedPutUrl, file, presignResponse.requiredHeaders);

  console.log('[Media API] Upload complete');
}
```

### Error Handling

```typescript
async function uploadMedia(file: File, metadata: MediaMetadata) {
  try {
    const presignResponse = await getSignedPutUrl(metadata);

    // Check response
    if (!presignResponse.objectKey) {
      throw new Error('Invalid presign response: Missing objectKey');
    }

    if (!presignResponse.signedPutUrl) {
      throw new Error('Invalid presign response: Missing signedPutUrl');
    }

    const expiresAt = new Date(presignResponse.expiresAt);
    if (expiresAt < new Date()) {
      throw new Error('Presigned URL has expired');
    }

    await uploadToStorage(presignResponse.signedPutUrl, file, presignResponse.requiredHeaders);

  } catch (error: any) {
    console.error('[Media API] Upload failed:', {
      error: error.message,
      stack: error.stack,
      metadata: metadata,
    });
    throw error;
  }
}
```

## State Management Debugging

### Logging State Changes

```typescript
import { useStore } from '@/stores/authStore';

const MyComponent = () => {
  const store = useStore();

  useEffect(() => {
    // Log state changes
    console.log('[State] Initial state:', {
      user: store.user,
      families: store.families,
      currentFamily: store.currentFamily,
    });
  }, [store.user, store.families, store.currentFamily]);

  // Alternatively, use Zustand subscriber
  useEffect(() => {
    const unsubscribe = useStore.subscribe(
      (state) => {
        console.log('[State] Store updated:', state);
      }
    );

    return unsubscribe;
  }, []);
};
```

### Debugging Async Actions

```typescript
const useStore = create<StoreState>()((set) => ({
  items: [],

  fetchItems: async () => {
    console.log('[Store] Fetching items...');
    set({ isLoading: true });

    try {
      const items = await apiFetchItems();
      console.log('[Store] Items fetched:', items.length);
      set({ items, isLoading: false });
    } catch (error) {
      console.error('[Store] Failed to fetch items:', error);
      set({ isLoading: false, error: error.message });
    }
  },
}));
```

## Performance Debugging

### Profiling with Chrome DevTools

```bash
# Open Chrome DevTools → Performance tab
# Click Record
# Interact with app
# Stop recording
# Analyze results
```

**What to look for:**
- **Long tasks** (>50ms) - indicates slow operations
- **Main thread blocking** - should move to Web Workers
- **Memory leaks** - increasing memory over time
- **Re-renders** - components rendering too often

### React Profiler

```typescript
import { Profiler } from 'react';

const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  // Log slow renders
  if (actualDuration > 50) {
    console.warn(`[Perf] Slow render: ${id} took ${actualDuration}ms`);
  }
};

const App = () => {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <AppShell>
        {/* Content */}
      </AppShell>
    </Profiler>
  );
};
```

### Identifying Re-renders

```typescript
import { useRef } from 'react';

const ExpensiveComponent = ({ data }: Props) => {
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;
    console.log(`[Perf] ${ExpensiveComponent.name} rendered ${renderCountRef.current} times`);
  });

  return (
    <div>
      {data.map(item => <Item key={item.id} {...item} />)}
    </div>
  );
};
```

## i18n Debugging

### Missing Translation Detection

```typescript
import { useTranslation } from 'react-i18next';

const TranslationDebug = ({ key, options }: Props) => {
  const { t } = useTranslation();
  const translation = t(key, options);

  // In development, warn if key is returned as-is
  if (import.meta.env.DEV && translation === key) {
    console.warn(`[i18n] Missing translation key: ${key}`);
    // Also show in UI
    return (
      <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
        ⚠️ Missing: {key}
      </div>
    );
  }

  return <span>{translation}</span>;
};

// Usage
<TranslationDebug key="nonexistent.key" />
```

### Testing All Translations

```typescript
import en from '@/locales/en.json';
import zhTW from '@/locales/zh-TW.json';

// Check for missing keys
const enKeys = Object.keys(en.translation);
const zhKeys = Object.keys(zhTW.translation);

const missingInZh = enKeys.filter(key => !(key in zhTW.translation));
const missingInEn = zhKeys.filter(key => !(key in en.translation));

console.log('[i18n] Keys missing in Chinese:', missingInZh);
console.log('[i18n] Keys missing in English:', missingInEn);
```

### Language Switching Debugging

```typescript
import { i18n } from 'react-i18next';

const LanguageSwitcher = () => {
  const changeLanguage = (lng: string) => {
    console.log(`[i18n] Switching language to: ${lng}`);

    i18n.changeLanguage(lng).then(() => {
      console.log(`[i18n] Language changed to: ${i18n.language}`);
      console.log(`[i18n] Loaded resources:`, i18n.store.data);

      localStorage.setItem('language', lng);
    });
  };

  return <button onClick={() => changeLanguage('en')}>English</button>;
};
```

## Animation Debugging

### Framer Motion DevTools

```typescript
// Add to component to debug animations
import { motion } from 'framer-motion';

const MyComponent = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      // Debug props (remove in production)
      whileHover={() => console.log('[Animation] Hover triggered')}
      whileTap={() => console.log('[Animation] Tap triggered')}
      onAnimationStart={() => console.log('[Animation] Animation started')}
      onAnimationComplete={() => console.log('[Animation] Animation completed')}
    >
      {/* Content */}
    </motion.div>
  );
};
```

### Debugging Transition Issues

```typescript
const PageTransition = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <AnimatePresence mode="wait" onExitComplete={() => setIsAnimating(false)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        // Debug
        onAnimationStart={() => {
          console.log('[Animation] Page transition starting');
          setIsAnimating(true);
        }}
        onAnimationComplete={() => {
          console.log('[Animation] Page transition complete');
          setIsAnimating(false);
        }}
      >
        {/* Page content */}
      </motion.div>
    </AnimatePresence>
  );
};
```

## Network Debugging

### Chrome DevTools Network Tab

```bash
# Filter requests
# Click on specific request
# View details:
# - Request headers (Authorization, Content-Type)
# - Request payload
# - Response headers
# - Response body
# - Timing information
```

### Common Network Issues

```typescript
// 1. CORS errors
// Error: Access to fetch at 'http://localhost:8787' from origin has been blocked by CORS policy

// Solution: Add CORS headers to Media API
// Media API headers:
// Access-Control-Allow-Origin: *
// Access-Control-Allow-Methods: POST, GET, OPTIONS
// Access-Control-Allow-Headers: Authorization, Content-Type

// 2. Auth errors (401)
// Error: {"error":"Unauthorized"}

// Solution: Check Firebase token is valid
// Get new token: await user.getIdToken(true) // Force refresh

// 3. Timeouts
// Error: Request timeout after 30000ms

// Solution: Increase timeout or optimize query
const response = await fetch(url, {
  timeout: 60000, // 60 seconds
});
```

## Console Debugging

### Structured Logging

```typescript
interface LogLevel {
  ERROR: 'ERROR';
  WARN: 'WARN';
  INFO: 'INFO';
  DEBUG: 'DEBUG';
}

function log(level: LogLevel, category: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] [${category}] ${message}`;

  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
}

// Usage
log('INFO', 'Auth', 'User signed in', { uid: user.uid });
log('ERROR', 'Firestore', 'Failed to create baby', error);
log('WARN', 'Media API', 'Presigned URL expiring soon');
```

### Error Boundary

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component<Props, State> {
  state: { hasError: boolean; error: Error | null } = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 mb-4">
            Something went wrong
          </h2>
          <p className="text-red-600 mb-4">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap app
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## Debugging Checklist

### Component Not Rendering

- [ ] Check console for errors
- [ ] Verify React DevTools component tree
- [ ] Check if props are being passed correctly
- [ ] Verify state is being set correctly
- [ ] Check useEffect dependencies
- [ ] Verify conditionals in JSX

### State Not Updating

- [ ] Check if Zustand store action is being called
- [ ] Verify action is creating new objects/arrays (immutability)
- [ ] Check Zustand DevTools for state changes
- [ ] Verify component is subscribing to store
- [ ] Check for stale closures

### API Not Working

- [ ] Check Network tab for failed requests
- [ ] Verify Firebase token is valid
- [ ] Check API endpoint is correct
- [ ] Verify CORS headers (if cross-origin)
- [ ] Check Media API is running
- [ ] Verify family membership validation

### Performance Issues

- [ ] Use React Profiler to find slow renders
- [ ] Check for unnecessary re-renders
- [ ] Verify lazy loading is working
- [ ] Check for memory leaks
- [ ] Verify images are optimized
- [ ] Check for large bundle sizes

### i18n Issues

- [ ] Verify translation key exists
- [ ] Check i18n instance is initialized
- [ ] Verify language is set correctly
- [ ] Check translation file is loaded
- [ ] Look for console warnings

### Animation Issues

- [ ] Verify Framer Motion is installed
- [ ] Check AnimatePresence mode="wait"
- [ ] Verify variants are defined correctly
- [ ] Check transition duration
- [ ] Verify key prop is unique

## Debugging Tools

### Chrome DevTools

- **React DevTools**: Inspect components, props, state
- **Zustand DevTools**: Debug state management
- **Network Tab**: Inspect API requests
- **Performance Tab**: Profile app performance
- **Console**: View logs and errors

### Firebase Emulator UI

- **http://localhost:4000**: Full emulator dashboard
- View Firestore data
- View Auth users
- Create test data
- Test security rules

### Command Line

```bash
# Check for TypeScript errors
npm run type-check

# Run tests
npm test

# Build and check for errors
npm run build
```

## Anti-Patterns to Avoid

### ❌ console.log in Production

```typescript
// ❌ WRONG - logs in production
console.log('Debug info');

// ✅ RIGHT - only in development
if (import.meta.env.DEV) {
  console.log('Debug info');
}
```

### ❌ Alert for Debugging

```typescript
// ❌ WRONG - alerts
alert('Error: ' + error.message);

// ✅ RIGHT - proper error display
<ErrorMessage error={error.message} />
```

### ❌ Silent Errors

```typescript
// ❌ WRONG - ignore errors
try {
  await apiCall();
} catch (error) {
  // Silent - no error handling
}

// ✅ RIGHT - handle errors
try {
  await apiCall();
} catch (error) {
  console.error('API call failed:', error);
  setError(error.message);
  showNotification({ type: 'error', message: error.message });
}
```

## Key Patterns Summary

### ✅ DO:
- Use React DevTools for component debugging
- Use Zustand DevTools for state debugging
- Use Firebase Emulator UI for Firebase debugging
- Use Chrome Network tab for API debugging
- Add structured logging (timestamp, level, category)
- Use Error Boundaries to catch errors
- Profile performance with React Profiler
- Debug i18n with missing key detection
- Test animations with Framer Motion callbacks
- Use environment variables to control debug output

### ❌ DON'T:
- Use console.log in production
- Use alert() for debugging
- Ignore errors silently
- Forget to clean up effects
- Don't check for re-renders
- Skip error boundary implementation
- Mix production and development code
- Hardcode values (use environment variables)

## Related Skills

- `react-typescript` - React/TypeScript patterns
- `pwa-specific` - Domain-specific patterns
- `testing` - Testing patterns to prevent bugs
