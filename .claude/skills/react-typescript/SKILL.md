---
name: react-typescript
description: React + TypeScript patterns for TimeHut PWA. Use when working with React components, Zustand stores, Firebase integration, animations, and i18n.
---

# React + TypeScript Patterns for TimeHut PWA

## When to Use

Use this skill when:
- Creating React components (pages, layouts, UI components)
- Working with TypeScript types and interfaces
- Implementing Zustand stores
- Integrating Firebase (Auth, Firestore)
- Using Framer Motion animations
- Working with react-router-dom routing
- Implementing i18n with react-i18next

## Component Patterns

### Page Component Structure

**Template for page components:**

```typescript
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { motion } from 'framer-motion';

const PageComponent = () => {
  // 1. Hooks first (always at top)
  const { t } = useTranslation();
  const { user, currentFamily, babies } = useAuthStore();
  const [localState, setLocalState] = useState<Type>(initialValue);

  // 2. Effects (useEffect)
  useEffect(() => {
    // Side effects, subscriptions, etc.
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  // 3. Event handlers
  const handleClick = (event: React.MouseEvent) => {
    // Handle events
  };

  const handleAsync = async () => {
    try {
      // Async operations
    } catch (error) {
      console.error('Operation failed:', error);
    }
  };

  // 4. Render (always return JSX)
  return (
    <div className="...">
      {/* Content */}
    </div>
  );
};

export default PageComponent;
```

**Key Points:**
- Hooks at top of component
- Effects after hooks
- Handlers before return
- Use `useTranslation()` for i18n
- Import stores from `@/stores/*`
- Export default component

### Lazy Loading Pages

**Use React.lazy for code splitting:**

```typescript
// In App.tsx
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const TimelinePage = lazy(() => import('@/pages/TimelinePage'));
const CalendarPage = lazy(() => import('@/pages/CalendarPage'));

// Wrap with Suspense
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/timeline" element={<TimelinePage />} />
  </Routes>
</Suspense>
```

**Why:** Reduces initial bundle size, improves load time.

### Protected vs Public Routes

**Wrap protected routes with ProtectedRoute:**

```typescript
// Public route
<Route
  path="/auth"
  element={<AuthPage />}
/>

// Protected route
<Route
  path="/timeline"
  element={
    <ProtectedRoute>
      <AppShell>
        <TimelinePage />
      </AppShell>
    </ProtectedRoute>
  }
/>
```

**ProtectedRoute** checks authentication before rendering children.

### Layout Components

**Use AppShell for consistent layout:**

```typescript
import Navigation from '@/components/Navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const AppShell = ({ children }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <header>
        <Navigation />
        <LanguageSwitcher />
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer>
        {/* Footer content */}
      </footer>
    </div>
  );
};
```

## Framer Motion Patterns

### Page Transitions

**Animate page transitions:**

```typescript
import { motion, AnimatePresence } from 'framer-motion';

// Page variants
const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  enter: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.4,
};

// In component
<AnimatePresence mode="wait">
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="enter"
    exit="exit"
    transition={pageTransition}
  >
    {/* Page content */}
  </motion.div>
</AnimatePresence>
```

**Animation Variants:**
- `initial`: Starting state
- `enter`: State when entering
- `exit`: State when leaving
- `transition`: Timing and easing

### Loading Animation

**Morphing blob loader:**

```typescript
const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-purple-50">
      <motion.div
        className="w-24 h-24 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          borderRadius: ['50%', '60%', '50%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};
```

## Zustand Store Patterns

### Store Template

```typescript
import { create } from 'zustand';

interface StoreState {
  // State
  items: Type[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchItems: () => Promise<void>;
  addItem: (item: Type) => void;
  updateItem: (id: string, updates: Partial<Type>) => void;
  removeItem: (id: string) => void;
  reset: () => void;
}

const useStore = create<StoreState>((set, get) => ({
  // Initial state
  items: [],
  isLoading: false,
  error: null,

  // Actions
  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await fetchItems();
      set({ items, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addItem: (item) => {
    set({ items: [...get().items, item] });
  },

  updateItem: (id, updates) => {
    set({
      items: get().items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  },

  removeItem: (id) => {
    set({ items: get().items.filter(item => item.id !== id) });
  },

  reset: () => set(initialState),
}));

export default useStore;
```

### Async Actions

**Handle async operations with loading states:**

```typescript
fetchItems: async () => {
  set({ isLoading: true, error: null });

  try {
    const items = await apiFetchItems();
    set({ items, isLoading: false });
  } catch (error) {
    console.error('Failed to fetch items:', error);
    set({ error: error.message, isLoading: false });
    throw error; // Re-throw for caller to handle
  }
},
```

### Immutability

**Always return new objects/arrays:**

```typescript
// ❌ WRONG - mutates state
addItem: (item) => {
  get().items.push(item);
  set({ items: get().items });
}

// ✅ RIGHT - creates new array
addItem: (item) => {
  set({ items: [...get().items, item] });
}

// ❌ WRONG - mutates object
updateItem: (id, updates) => {
  const item = get().items.find(i => i.id === id);
  Object.assign(item, updates);
  set({ items: get().items });
}

// ✅ RIGHT - creates new object
updateItem: (id, updates) => {
  set({
    items: get().items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ),
  });
}
```

### Selector Helpers

**Create selectors for common patterns:**

```typescript
export const selectCurrentFamily = (state: AuthState) => state.currentFamily;
export const selectBabies = (state: AuthState) => state.babies;
export const selectIsAdmin = (state: AuthState) => {
  if (!state.currentFamily || !state.uid) return false;
  const member = state.currentFamily.members[state.uid];
  return member?.role === 'admin';
};
```

## Firebase Integration Patterns

### Auth Patterns

**Using Firebase Auth:**

```typescript
import { getAuthInstance } from '@/lib/firebase/config';
import {
  signInWithEmailLink,
  signOut as firebaseSignOut,
  getCurrentUser,
  onAuthStateChange,
} from '@/lib/firebase/auth';

// Get auth instance
const auth = getAuthInstance();

// Sign in with email link
const handleSignIn = async (email: string) => {
  const auth = getAuthInstance();
  await signInWithEmailLink(auth, email, window.location.href);
};

// Sign out
const handleSignOut = async () => {
  const auth = getAuthInstance();
  await firebaseSignOut(auth);
};

// Listen to auth state changes
useEffect(() => {
  const unsubscribe = onAuthStateChange(auth, (user) => {
    // Handle auth state change
  });

  return () => unsubscribe();
}, []);
```

### Firestore Patterns

**CRUD operations:**

```typescript
import { getFirestoreInstance } from '@/lib/firebase/config';
import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
} from '@/lib/firebase/firestore';

// Get documents
const fetchBabies = async (familyId: string) => {
  const db = getFirestoreInstance();
  const babies = await getDocuments<BabyDocument>(
    db,
    'families',
    familyId,
    'babies'
  );
  return babies;
};

// Create document
const createBaby = async (familyId: string, baby: Omit<BabyDocument, 'id' | 'createdAt'>) => {
  const db = getFirestoreInstance();
  const babyId = await createDocument(db, 'families', familyId, 'babies', baby);
  return babyId;
};

// Update document
const updateBaby = async (familyId: string, babyId: string, updates: Partial<BabyDocument>) => {
  const db = getFirestoreInstance();
  await updateDocument(db, 'families', familyId, 'babies', babyId, updates);
};

// Delete document
const deleteBaby = async (familyId: string, babyId: string) => {
  const db = getFirestoreInstance();
  await deleteDocument(db, 'families', familyId, 'babies', babyId);
};
```

### Type Safety

**Use TypeScript interfaces for Firestore documents:**

```typescript
export interface FamilyDocument {
  id: string;
  name: string;
  createdAt: string;
  members: Record<string, FamilyMember>;
  settings: FamilySettings;
}

export interface BabyDocument {
  id: string;
  name: string;
  dob: string;
  gender: 'male' | 'female';
  createdAt: string;
}

export interface MomentDocument {
  id: string;
  babyId: string;
  dateTaken: string;
  mediaType: 'photo' | 'video';
  objectKey: string;
  caption?: string;
  createdAt: string;
}
```

### Security Rules

**Always validate family membership:**

```typescript
const updateBaby = async (familyId: string, babyId: string, updates: Partial<BabyDocument>) => {
  // ✅ Check user is member of family
  const { uid } = getAuthInstance().currentUser;
  const family = await getDocument<FamilyDocument>(db, 'families', familyId);

  if (!family.members[uid]) {
    throw new Error('Not authorized to update this baby');
  }

  // ✅ Proceed with update
  await updateDocument(db, 'families', familyId, 'babies', babyId, updates);
};
```

## i18n Patterns

### Using Translations

**Use `useTranslation()` hook:**

```typescript
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('timeline.title')}</h1>
      <p>{t('timeline.description')}</p>
      <button>{t('timeline.addPhoto')}</button>
    </div>
  );
};
```

### Translation Keys

**Use dot notation for nested keys:**

```typescript
// In translation file
{
  "timeline": {
    "title": "Timeline",
    "description": "View your baby's moments",
    "addPhoto": "Add Photo"
  }
}

// In component
t('timeline.title') // "Timeline"
t('timeline.addPhoto') // "Add Photo"
```

### Interpolation

**Pass variables to translations:**

```typescript
// In translation file
{
  "welcome": "Welcome, {{name}}!"
}

// In component
t('welcome', { name: user.name }) // "Welcome, John!"
```

### Date/Time Localization

**Use i18next for dates:**

```typescript
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { i18n } = useTranslation();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return <p>{formatDate('2026-01-15')}</p>;
};
```

## TypeScript Best Practices

### Type Imports

**Use `import type` for type-only imports:**

```typescript
// ✅ RIGHT
import type { FamilyDocument, BabyDocument } from '@/types/firestore';

// ❌ WRONG
import { FamilyDocument, BabyDocument } from '@/types/firestore';
```

**Why:** Reduces bundle size by not including code.

### Strict Mode Compliance

**Enable and respect strict mode:**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
  }
}

// In code
const processData = (input: string) => {
  // ✅ TypeScript catches missing return
  return input.toUpperCase();
};

// ✅ TypeScript catches unused variables
const unused = 123;
```

### Union Types

**Use unions for finite options:**

```typescript
// ✅ RIGHT - explicit union
type Gender = 'male' | 'female';
type MediaType = 'photo' | 'video';

// ❌ WRONG - too broad
type Gender = string;
type MediaType = string;
```

### Type Guards

**Use type guards for runtime checks:**

```typescript
function isFamilyMember(value: unknown): value is FamilyMember {
  return typeof value === 'object' && value !== null && 'role' in value;
}

const member = data as unknown;
if (isFamilyMember(member)) {
  // TypeScript knows member is FamilyMember
  console.log(member.role);
}
```

## Performance Patterns

### Memoization

**Use React.memo for expensive components:**

```typescript
import { memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  // Expensive computation
  return <div>{/* ... */}</div>;
});
```

### Lazy Loading

**Lazy load routes:**

```typescript
// ✅ RIGHT - lazy load pages
const TimelinePage = lazy(() => import('@/pages/TimelinePage'));

// ❌ WRONG - eager load all pages
import TimelinePage from '@/pages/TimelinePage';
```

### Code Splitting

**Dynamic imports for heavy features:**

```typescript
const loadFeature = async () => {
  const { default: FeatureModule } = await import('@/features/HeavyFeature');
  return FeatureModule;
};
```

## Anti-Patterns to Avoid

### ❌ Mutating State Directly

```typescript
// ❌ WRONG
const [items, setItems] = useState([]);
items.push(newItem); // Mutates array!

// ✅ RIGHT
const [items, setItems] = useState([]);
setItems([...items, newItem]); // Creates new array
```

### ❌ Ignoring TypeScript Errors

```typescript
// ❌ WRONG - suppress errors
const data: any = response.data as any;

// ✅ RIGHT - define proper type
interface ApiResponse {
  data: DataType;
}
const data: ApiResponse = response.data;
```

### ❌ Missing Error Handling

```typescript
// ❌ WRONG - no error handling
const handleClick = async () => {
  await apiCall();
};

// ✅ RIGHT - handle errors
const handleClick = async () => {
  try {
    await apiCall();
  } catch (error) {
    console.error('Failed:', error);
    // Show error to user
  }
};
```

### ❌ Not Cleaning Up Effects

```typescript
// ❌ WRONG - no cleanup
useEffect(() => {
  const subscription = subscribe();
}, []);

// ✅ RIGHT - cleanup on unmount
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
```

## Common Component Patterns

### Button Component

```typescript
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  isLoading?: boolean;
}

const Button = ({ onClick, children, variant = 'primary', disabled = false, isLoading = false }: ButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        px-4 py-2 rounded-lg font-medium transition-colors
        ${variant === 'primary' ? 'bg-pink-500 hover:bg-pink-600 text-white' : ''}
        ${variant === 'secondary' ? 'bg-gray-200 hover:bg-gray-300' : ''}
        ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {isLoading ? <Spinner /> : children}
    </motion.button>
  );
};
```

### Form Component

```typescript
interface FormProps<T> {
  onSubmit: (data: T) => Promise<void>;
  children: (methods: UseFormReturn<T>) => React.ReactNode;
}

const Form = <T extends Record<string, unknown>>({ onSubmit, children }: FormProps<T>) => {
  const methods = useForm<T>();

  const handleSubmit = async (data: T) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  return (
    <form onSubmit={methods.handleSubmit(handleSubmit)}>
      {children(methods)}
    </form>
  );
};
```

## Related Skills

- `pwa-specific` - Domain-specific patterns (age calculation, media upload, WHO data)
- `testing` - Testing patterns for React/TypeScript
- `firebase` - Firebase integration patterns
