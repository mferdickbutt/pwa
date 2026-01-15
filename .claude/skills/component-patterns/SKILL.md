---
name: component-patterns
description: Reusable component patterns for TimeHut PWA. Use when creating pages, layouts, forms, or UI components.
---

# Component Patterns for TimeHut PWA

## When to Use

Use this skill when:
- Creating page components (Auth, Timeline, Calendar, Growth, Capsules, Baby Profile, Settings)
- Building layout components (AppShell, Navigation)
- Creating form components (inputs, selects, buttons)
- Implementing UI components (cards, modals, lists)
- Working with component composition
- Using Framer Motion for animations

## Page Component Structure

### Template

```typescript
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import type { BabyDocument } from '@/types/firestore';

interface PageProps {
  // Define props here
}

const PageComponent: React.FC<PageProps> = ({ /* props */ }) => {
  // 1. Hooks (always at top)
  const { t } = useTranslation();
  const { user, currentFamily, babies } = useAuthStore();
  const [state, setState] = useState<Type>(initialValue);

  // 2. Effects
  useEffect(() => {
    // Side effects, subscriptions
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

## Layout Components

### AppShell

```typescript
import { Outlet, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const AppShell = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-pink-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              {/* Logo */}
              <Link to="/timeline" className="flex items-center">
                <span className="text-2xl font-bold text-pink-600">🍼</span>
                <span className="ml-2 text-lg font-semibold text-gray-700">TimeHut</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Navigation />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-pink-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-600">
            {t('common.footer')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
```

## Form Components

### Button Component

```typescript
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  onClick: () => void | Promise<void>;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  onClick,
  children,
  ...motionProps
}) => {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled || isLoading) return;

    await onClick();
  };

  const baseClasses = 'font-medium rounded-lg transition-colors';
  const variantClasses = {
    primary: 'bg-pink-500 hover:bg-pink-600 text-white disabled:bg-pink-300',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:bg-gray-100',
    danger: 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-300',
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      {...motionProps}
      onClick={handleClick}
      disabled={disabled || isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {isLoading ? <Spinner /> : children}
    </motion.button>
  );
};

export default Button;
```

### Input Component

```typescript
import { useTranslation } from 'react-i18next';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'date';
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
}) => {
  const { t } = useTranslation();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-2 border rounded-lg
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-pink-500'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          focus:outline-none focus:ring-2
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
```

### Select Component

```typescript
import { useTranslation } from 'react-i18next';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-4 py-2 border rounded-lg
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100' : 'bg-white'}
        `}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;
```

### Spinner Component

```typescript
const Spinner: React.FC = () => {
  return (
    <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-pink-600 border-t-transparent"></div>
  );
};

export default Spinner;
```

## Card Components

### Card Wrapper

```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-pink-200 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
```

### Moment Card

```typescript
import { motion } from 'framer-motion';
import { MediaCard } from '@/components/MediaCard';
import type { MomentDocument } from '@/types/firestore';
import { calculateAge } from '@/lib/utils/age';
import { useTranslation } from 'react-i18next';

interface MomentCardProps {
  moment: MomentDocument;
  babyDob: string;
}

const MomentCard: React.FC<MomentCardProps> = ({ moment, babyDob }) => {
  const { t } = useTranslation();
  const age = calculateAge(babyDob, moment.dateTaken);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Media */}
      <MediaCard objectKey={moment.objectKey} mediaType={moment.mediaType} />

      {/* Content */}
      <div className="p-4">
        {/* Age Badge */}
        <div className="inline-flex items-center px-3 py-1 bg-pink-100 rounded-full text-sm font-medium text-pink-800 mb-2">
          {age.display}
        </div>

        {/* Caption */}
        {moment.caption && (
          <p className="text-gray-700 text-sm mt-2">{moment.caption}</p>
        )}

        {/* Date */}
        <p className="text-gray-500 text-xs mt-2">
          {new Date(moment.dateTaken).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );
};

export default MomentCard;
```

### Capsule Card

```typescript
import { motion } from 'framer-motion';
import { MediaCard } from '@/components/MediaCard';
import type { CapsuleDocument } from '@/types/firestore';
import { useTranslation } from 'react-i18next';

interface CapsuleCardProps {
  capsule: CapsuleDocument;
  onUnlock?: (capsuleId: string) => void;
}

const CapsuleCard: React.FC<CapsuleCardProps> = ({ capsule, onUnlock }) => {
  const { t } = useTranslation();
  const now = new Date();
  const isLocked = new Date(capsule.unlockDate) > now;
  const daysUntil = Math.ceil(
    (new Date(capsule.unlockDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Lock Icon */}
      <div className="relative h-48 bg-gradient-to-b from-pink-100 to-purple-100">
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">🔒</span>
          </div>
        )}
        {!isLocked && (
          <MediaCard objectKey={capsule.mediaKeys[0]} mediaType="photo" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{capsule.title}</h3>

        {isLocked && (
          <p className="text-pink-600 mb-4">
            {t('capsules.unlockIn', { days: daysUntil })}
          </p>
        )}

        {!isLocked && (
          <>
            {capsule.message && (
              <p className="text-gray-700 mb-4">{capsule.message}</p>
            )}
            <button
              onClick={() => onUnlock?.(capsule.id)}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg"
            >
              {t('common.open')}
            </button>
          </>
        )}

        <p className="text-gray-500 text-xs mt-2">
          Unlock: {new Date(capsule.unlockDate).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );
};

export default CapsuleCard;
```

## List Components

### Grid List

```typescript
interface GridListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  emptyMessage?: string;
  loading?: boolean;
}

function GridList<T>({ items, renderItem, keyExtractor, emptyMessage, loading }: GridListProps<T>) {
  const { t } = useTranslation();

  if (loading) {
    return <Spinner />;
  }

  if (items.length === 0 && emptyMessage) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <motion.div
          key={keyExtractor(item, index)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </div>
  );
}

export default GridList;
```

### Infinite Scroll List

```typescript
import { useEffect, useRef, useState } from 'react';

interface InfiniteScrollProps<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
}

function InfiniteScroll<T>({
  items,
  loading,
  hasMore,
  onLoadMore,
  renderItem,
}: InfiniteScrollProps<T>) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, onLoadMore]);

  return (
    <>
      {items.map((item, index) => renderItem(item, index))}
      {hasMore && (
        <div ref={loadMoreRef} className="py-8">
          {loading ? <Spinner /> : null}
        </div>
      )}
    </>
  );
}

export default InfiniteScroll;
```

## Modal Components

### Modal Wrapper

```typescript
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    // Lock body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
              {/* Header */}
              {title && (
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                  <button
                    onClick={onClose}
                    className="float-right text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Body */}
              <div className="px-6 py-4">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
```

## Navigation Components

### Navigation Item

```typescript
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface NavItem {
  to: string;
  icon: string;
  labelKey: string;
}

const NavigationItem: React.FC<NavItem> = ({ to, icon, labelKey }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`
        flex items-center px-4 py-3 rounded-lg transition-colors
        ${isActive ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-pink-50'}
      `}
    >
      <span className="text-xl mr-3">{icon}</span>
      <span className="font-medium">{t(labelKey)}</span>
      {isActive && <div className="ml-auto w-1 h-1 bg-pink-600 rounded-full" />}
    </Link>
  );
};

export default NavigationItem;
```

## Anti-Patterns to Avoid

### ❌ Inline Styles

```typescript
// ❌ WRONG
<div style={{ padding: '20px', color: 'blue' }} />

// ✅ RIGHT
<div className="p-5 text-blue-600" />
```

### ❌ Non-Reusable Components

```typescript
// ❌ WRONG - duplicate code
const Page1 = () => {
  return (
    <div className="card">
      <h3>Title</h3>
      <p>Content</p>
    </div>
  );
};

const Page2 = () => {
  return (
    <div className="card">
      <h3>Title</h3>
      <p>Content</p>
    </div>
  );
};

// ✅ RIGHT - reusable component
const Card = ({ title, children }) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
};
```

### ❌ Missing Accessibility

```typescript
// ❌ WRONG - no ARIA labels
<button>Submit</button>

// ✅ RIGHT - proper accessibility
<button type="submit" aria-label="Submit form">Submit</button>
```

### ❌ Not Handling Loading State

```typescript
// ❌ WRONG - no loading indicator
const Button = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};

// ✅ RIGHT - show loading state
const Button = ({ onClick, children, isLoading }) => {
  return (
    <button disabled={isLoading} onClick={onClick}>
      {isLoading ? <Spinner /> : children}
    </button>
  );
};
```

## Key Patterns Summary

### ✅ DO:
- Use TypeScript for all components
- Extract reusable components
- Use Framer Motion for animations
- Handle loading and error states
- Use Tailwind CSS utility classes
- Implement proper accessibility (ARIA labels)
- Use composable components
- Implement form validation
- Handle keyboard events (Escape, Enter)
- Use motion variants for consistent animations

### ❌ DON'T:
- Use inline styles (use Tailwind)
- Duplicate component logic (extract to reusable)
- Skip accessibility features
- Ignore loading states
- Hardcode text (use i18n)
- Mix concerns (presentation + logic)
- Use class components (use functional components)
- Forget to clean up effects

## Related Skills

- `react-typescript` - React/TypeScript patterns
- `pwa-specific` - Domain-specific patterns
- `testing` - Testing patterns for components
