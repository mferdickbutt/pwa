---
name: testing
description: Testing patterns for TimeHut PWA using Vitest + React Testing Library. Use when writing tests, setting up testing framework, or testing components, stores, and Firebase integration.
---

# Testing Patterns for TimeHut PWA

## When to Use

Use this skill when:
- Setting up testing framework
- Writing component tests
- Testing Zustand stores
- Testing Firebase integration
- Testing async operations
- Testing i18n
- Writing integration tests

## Testing Stack

### Recommended Tools
- **Vitest**: Fast native Vite testing
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **Firebase Emulators**: Firebase integration testing
- **@testing-library/jest-dom**: DOM queries (Jest-compatible)

### Setup

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**src/test/setup.ts:**
```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import * as firebase from '@firebase/app';

// Mock Firebase
vi.mock('@firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
}));

// Mock environment variables
process.env.VITE_MEDIA_API_URL = 'http://localhost:8787';
process.env.VITE_FIREBASE_PROJECT_ID = 'test-project';
```

## Component Testing

### Basic Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PageComponent from '@/pages/PageComponent';

describe('PageComponent', () => {
  it('renders title', () => {
    render(<PageComponent />);

    expect(screen.getByText('Page Title')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<PageComponent isLoading />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
```

### User Interaction Tests

```typescript
import userEvent from '@testing-library/user-event';

describe('Button Component', () => {
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when loading', () => {
    render(<Button onClick={vi.fn()} isLoading={true}>Click me</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
```

### Form Testing

```typescript
describe('Onboarding Form', () => {
  it('validates required fields', async () => {
    render(<OnboardingPage />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('submits with valid data', async () => {
    const createFamily = vi.fn();
    render(<OnboardingPage onCreateFamily={createFamily} />);

    const nameInput = screen.getByLabelText(/family name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await userEvent.type(nameInput, 'My Family');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);

    expect(createFamily).toHaveBeenCalledWith('My Family', 'test@example.com');
  });
});
```

### Async Component Tests

```typescript
describe('TimelinePage', () => {
  it('loads moments on mount', async () => {
    const fetchMoments = vi.fn().mockResolvedValue(mockMoments);
    render(<TimelinePage fetchMoments={fetchMoments} />);

    // Wait for async data
    await waitFor(() => {
      expect(screen.getByText('Moment 1')).toBeInTheDocument();
    });
  });

  it('shows error state', async () => {
    const fetchMoments = vi.fn().mockRejectedValue(new Error('Failed'));
    render(<TimelinePage fetchMoments={fetchMoments} />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });
});
```

## Zustand Store Testing

### Basic Store Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import useAuthStore from '@/stores/authStore';
import * as firebase from '@/lib/firebase/auth';

// Mock Firebase
vi.mock('@/lib/firebase/auth', () => ({
  getAuthInstance: vi.fn(() => ({ currentUser: null })),
  onAuthStateChange: vi.fn(),
  getCurrentUser: vi.fn(() => null),
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
  });

  it('initializes with default state', () => {
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.families).toEqual([]);
    expect(state.babies).toEqual([]);
  });

  it('fetches families on initialize', async () => {
    const state = useAuthStore.getState();

    await state.initialize();

    expect(state.families).toHaveLength(1);
  });
});
```

### Store Actions

```typescript
describe('useAuthStore', () => {
  it('creates family', async () => {
    const state = useAuthStore.getState();
    const createFamilyDoc = vi.fn().mockResolvedValue('family-123');

    await state.createFamily('My Family');

    expect(createFamilyDoc).toHaveBeenCalledWith('My Family', expect.any(String));
    expect(state.families).toHaveLength(1);
  });

  it('sets current family', async () => {
    const state = useAuthStore.getState();
    const fetchFamily = vi.fn().mockResolvedValue(mockFamily);

    await state.setCurrentFamily('family-123');

    expect(fetchFamily).toHaveBeenCalledWith('family-123');
    expect(state.currentFamily).toEqual(mockFamily);
  });
});
```

### Store Selectors

```typescript
import { selectCurrentFamily, selectIsAdmin } from '@/stores/authStore';

describe('Store Selectors', () => {
  it('returns current family', () => {
    const state = useAuthStore.getState();
    state.families = [{ id: 'family-1', ... }];
    state.currentFamilyId = 'family-1';

    expect(selectCurrentFamily(state)).toEqual(state.families[0]);
  });

  it('returns admin status', () => {
    const state = useAuthStore.getState();
    state.currentFamily = {
      id: 'family-1',
      members: { 'user-1': { role: 'admin' } },
    };
    state.uid = 'user-1';

    expect(selectIsAdmin(state)).toBe(true);
  });
});
```

## Firebase Integration Testing

### Auth Testing

```typescript
import { describe, it, expect, vi } from 'vitest';
import * as auth from '@/lib/firebase/auth';

describe('Firebase Auth', () => {
  it('signs in with email link', async () => {
    const auth = { currentUser: null };
    vi.spyOn(auth, 'getAuthInstance').mockReturnValue(auth as any);
    vi.spyOn(auth, 'signInWithEmailLink').mockResolvedValue(undefined);

    const email = 'test@example.com';
    await auth.signInWithEmailLink(auth, email, 'http://localhost:5173/auth');

    expect(auth.signInWithEmailLink).toHaveBeenCalledWith(auth, email, 'http://localhost:5173/auth');
  });

  it('signs out', async () => {
    const auth = { currentUser: mockUser };
    vi.spyOn(auth, 'getAuthInstance').mockReturnValue(auth as any);
    vi.spyOn(auth, 'signOut').mockResolvedValue(undefined);

    await auth.signOut(auth);

    expect(auth.signOut).toHaveBeenCalledWith(auth);
  });
});
```

### Firestore Testing

```typescript
import { describe, it, expect, vi } from 'vitest';
import * as firestore from '@/lib/firebase/firestore';
import type { BabyDocument } from '@/types/firestore';

describe('Firestore Operations', () => {
  it('creates baby document', async () => {
    const db = mockFirestoreInstance();
    const collectionRef = vi.fn();
    const docRef = vi.fn();
    const setDoc = vi.fn().mockResolvedValue(undefined);

    vi.spyOn(firestore, 'getFirestoreInstance').mockReturnValue(db as any);
    db.collection = vi.fn().mockReturnValue(collectionRef);
    collectionRef.doc = vi.fn().mockReturnValue(docRef);
    docRef.set = setDoc;

    const babyData = { name: 'Baby', dob: '2025-01-01', gender: 'male' as const };
    await firestore.createBaby(db, 'family-123', babyData);

    expect(setDoc).toHaveBeenCalledWith({
      ...babyData,
      createdAt: expect.any(String),
      id: expect.any(String),
    });
  });

  it('updates baby document', async () => {
    const db = mockFirestoreInstance();
    const docRef = vi.fn();
    const updateDoc = vi.fn().mockResolvedValue(undefined);

    vi.spyOn(firestore, 'getFirestoreInstance').mockReturnValue(db as any);
    db.collection = vi.fn().mockReturnValue({ doc: vi.fn().mockReturnValue(docRef) });
    docRef.update = updateDoc;

    const updates = { name: 'Updated Baby' };
    await firestore.updateBaby(db, 'family-123', 'baby-123', updates);

    expect(updateDoc).toHaveBeenCalledWith(updates);
  });
});
```

### Mocking Firestore

```typescript
function mockFirestoreInstance() {
  return {
    collection: vi.fn(() => ({
      doc: vi.fn(),
      where: vi.fn(),
      orderBy: vi.fn(),
      limit: vi.fn(),
      getDocs: vi.fn(),
    })),
    doc: vi.fn(),
    batch: vi.fn(),
    runTransaction: vi.fn(),
  };
}

// In test
vi.spyOn(firestore, 'getFirestoreInstance').mockReturnValue(mockFirestoreInstance() as any);
```

## API Testing

### Media API Mocking

```typescript
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

describe('Media API', () => {
  const server = setupServer();

  beforeAll(() => {
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  it('presigns upload', async () => {
    server.use(
      rest.post('http://localhost:8787/media/presignUpload', (req, res, ctx) => {
        return res(
          ctx.json({
            objectKey: 'photos/abc123.jpg',
            signedPutUrl: 'https://example.com/presigned',
            requiredHeaders: { 'Content-Type': 'image/jpeg' },
            expiresAt: '2026-01-15T10:00:00Z',
          }),
          { status: 200 }
        );
      })
    );

    const result = await presignUpload({
      familyId: 'family-123',
      babyId: 'baby-123',
      contentType: 'image/jpeg',
      fileSizeBytes: 1024,
      mediaType: 'photo',
    });

    expect(result.objectKey).toBe('photos/abc123.jpg');
  });

  it('handles auth errors', async () => {
    server.use(
      rest.post('http://localhost:8787/media/presignUpload', (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({ error: 'Unauthorized' }));
      })
    );

    await expect(
      presignUpload({ ... })
    ).rejects.toThrow('Not authenticated');
  });
});
```

## i18n Testing

### Translation Keys

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import PageComponent from '@/pages/PageComponent';

const i18nInstance = createInstance({
  resources: {
    en: {
      translation: {
        'common': {
          'save': 'Save',
          'cancel': 'Cancel',
        },
        'timeline': {
          'title': 'Timeline',
        },
      },
    },
  },
  lng: 'en',
});

describe('i18n', () => {
  it('renders translated text', () => {
    render(
      <I18nextProvider i18n={i18nInstance}>
        <PageComponent />
      </I18nextProvider>
    );

    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });

  it('switches language', () => {
    const { rerender } = render(
      <I18nextProvider i18n={i18nInstance}>
        <PageComponent />
      </I18nextProvider>
    );

    // Change language
    await i18nInstance.changeLanguage('zh-TW');

    // Rerender
    rerender(
      <I18nextProvider i18n={i18nInstance}>
        <PageComponent />
      </I18nextProvider>
    );

    expect(screen.getByText(/時間線/i)).toBeInTheDocument(); // Chinese for "Timeline"
  });
});
```

## Integration Testing

### Full Flow Test

```typescript
describe('Onboarding Flow', () => {
  it('completes onboarding', async () => {
    // 1. Sign in
    const auth = mockAuthInstance();
    vi.spyOn(auth, 'signInWithEmailLink').mockResolvedValue(mockUser);

    // 2. Render onboarding page
    render(<OnboardingPage />);

    // 3. Create family
    const nameInput = screen.getByLabelText(/family name/i);
    await userEvent.type(nameInput, 'My Family');

    const createButton = screen.getByRole('button', { name: /create family/i });
    await userEvent.click(createButton);

    // 4. Verify family created
    await waitFor(() => {
      expect(screen.getByText(/family created/i)).toBeInTheDocument();
    });

    // 5. Navigate to timeline
    expect(window.location.pathname).toBe('/timeline');
  });
});
```

## Test Organization

### File Structure

```
src/
├── __tests__/
│   ├── components/           # Component tests
│   │   ├── Button.test.tsx
│   │   ├── TimelinePage.test.tsx
│   │   └── AuthPage.test.tsx
│   ├── stores/               # Store tests
│   │   ├── authStore.test.ts
│   │   └── momentStore.test.ts
│   ├── firebase/             # Firebase tests
│   │   ├── auth.test.ts
│   │   └── firestore.test.ts
│   ├── api/                 # API tests
│   │   └── media.test.ts
│   └── setup.ts             # Test setup
└── vitest.config.ts
```

### Test Patterns

**Naming Convention:**
- Component tests: `ComponentName.test.tsx`
- Store tests: `storeName.test.ts`
- Hook tests: `hookName.test.ts`
- API tests: `apiName.test.ts`

**Describe Blocks:**
- Use nested describes for related tests
- First-level: Component/module name
- Second-level: Feature/function being tested

## Anti-Patterns to Avoid

### ❌ Testing Implementation Details

```typescript
// ❌ WRONG - tests implementation
it('calls the API', () => {
  render(<Component />);
  expect(api.callApi).toHaveBeenCalled();
});

// ✅ RIGHT - tests behavior
it('displays data when loaded', async () => {
  render(<Component />);
  await waitFor(() => {
    expect(screen.getByText('Data')).toBeInTheDocument();
  });
});
```

### ❌ Testing Private Methods

```typescript
// ❌ WRONG - tests implementation details
it('formats date correctly', () => {
  const component = new Component();
  expect(component['formatDate']('2025-01-01')).toBe('January 1, 2025');
});

// ✅ RIGHT - tests public behavior
it('displays formatted date', () => {
  render(<Component date="2025-01-01" />);
  expect(screen.getByText('January 1, 2025')).toBeInTheDocument();
});
```

### ❌ Hardcoded Selectors

```typescript
// ❌ WRONG - brittle selector
expect(screen.getByTestId('submit-button')).toBeInTheDocument();

// ✅ RIGHT - accessible selector
expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
```

## Coverage Goals

**Target Coverage:**
- Components: 80%+
- Stores: 90%+
- Firebase: 70%+
- API: 80%+

**Critical Paths:**
- Authentication flow: 100%
- Onboarding flow: 100%
- Media upload flow: 100%
- Core features: 90%+

## Running Tests

**Run all tests:**
```bash
npm test
```

**Run in watch mode:**
```bash
npm test -- --watch
```

**Run with coverage:**
```bash
npm test -- --coverage
```

**Run specific file:**
```bash
npm test -- AuthPage.test.tsx
```

## Related Skills

- `react-typescript` - React/TypeScript component patterns
- `pwa-specific` - Domain-specific patterns (age calc, media upload)
- `firebase` - Firebase integration patterns
