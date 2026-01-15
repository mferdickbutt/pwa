---
name: i18n
description: Internationalization (i18n) patterns for TimeHut PWA. Use when working with react-i18next, adding translations, handling language switching, date/time localization, or number formatting.
---

# i18n Patterns for TimeHut PWA

## When to Use

Use this skill when:
- Setting up react-i18next configuration
- Adding translation keys to language files
- Switching languages in components
- Localizing dates, times, and numbers
- Working with RTL (right-to-left) languages
- Adding new languages to the app

## Setup Configuration

### i18next Configuration

**packages/frontend/src/lib/i18n/config.ts:**

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: () => import('@/locales/en.json'),
  },
  'zh-TW': {
    translation: () => import('@/locales/zh-TW.json'),
  },
};

export const initI18n = () => {
  initReactI18next({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    detection: {
      order: ['path', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
};
```

## Translation File Structure

### Nested Keys (Recommended)

**packages/frontend/src/locales/en.json:**

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Try Again"
  },
  "auth": {
    "title": "Sign In",
    "email": "Email",
    "sendLink": "Send Magic Link",
    "linkSent": "Magic link sent to {{email}}",
    "checkEmail": "Check your email for the sign-in link",
    "testAccount": "Test Account (Local Only)",
    "invalidEmail": "Please enter a valid email"
  },
  "timeline": {
    "title": "Timeline",
    "description": "View your baby's special moments",
    "addPhoto": "Add Photo",
    "addVideo": "Add Video",
    "empty": "No moments yet. Add your first memory!",
    "filter": "Filter",
    "sortBy": "Sort By"
  },
  "calendar": {
    "title": "Calendar",
    "month": "January|February|March|April|May|June|July|August|September|October|November|December",
    "previousMonth": "Previous Month",
    "nextMonth": "Next Month",
    "goToday": "Go to Today"
  },
  "growth": {
    "title": "Growth",
    "weight": "Weight",
    "length": "Length",
    "headCircumference": "Head Circumference",
    "percentile": "Percentile",
    "noData": "No WHO data available for this age",
    "ageOutRange": "Growth data only available for 0-36 months"
  },
  "capsules": {
    "title": "Time Capsules",
    "createCapsule": "Create Capsule",
    "locked": "Locked",
    "unlocked": "Unlocked",
    "unlockDate": "Unlock Date",
    "unlockIn": "Unlock in {{days}} days",
    "contents": "Contents",
    "message": "Message",
    "addToCapsule": "Add to Capsule"
  },
  "baby": {
    "title": "Baby Profile",
    "name": "Name",
    "dateOfBirth": "Date of Birth",
    "gender": "Gender",
    "male": "Boy",
    "female": "Girl",
    "editProfile": "Edit Profile",
    "milestones": "Milestones"
  },
  "settings": {
    "title": "Settings",
    "language": "Language",
    "theme": "Theme",
    "light": "Light",
    "dark": "Dark",
    "notifications": "Notifications",
    "logout": "Sign Out"
  }
}
```

### Chinese Translation

**packages/frontend/src/locales/zh-TW.json:**

```json
{
  "common": {
    "save": "儲存",
    "cancel": "取消",
    "delete": "刪除",
    "edit": "編輯",
    "loading": "載入中...",
    "error": "發生錯誤",
    "retry": "重試"
  },
  "auth": {
    "title": "登入",
    "email": "電子郵件",
    "sendLink": "發送魔法連結",
    "linkSent": "魔法連結已發送至 {{email}}",
    "checkEmail": "請檢查您的電子郵件中的登入連結",
    "testAccount": "測試帳號（僅限本地）",
    "invalidEmail": "請輸入有效的電子郵件"
  },
  "timeline": {
    "title": "時間線",
    "description": "查看寶寶的特別時刻",
    "addPhoto": "新增照片",
    "addVideo": "新增影片",
    "empty": "尚無時刻。新增第一個回憶！",
    "filter": "篩選",
    "sortBy": "排序方式"
  },
  "calendar": {
    "title": "行事曆",
    "month": "一月|二月|三月|四月|五月|六月|七月|八月|九月|十月|十一月|十二月",
    "previousMonth": "上個月",
    "nextMonth": "下個月",
    "goToday": "前往今天"
  },
  "growth": {
    "title": "成長紀錄",
    "weight": "體重",
    "length": "身高",
    "headCircumference": "頭圍",
    "percentile": "百分位",
    "noData": "此年齡無 WHO 成長數據",
    "ageOutRange": "成長數據僅適用於 0-36 個月"
  },
  "capsules": {
    "title": "時光膠囊",
    "createCapsule": "建立時光膠囊",
    "locked": "已鎖定",
    "unlocked": "已解鎖",
    "unlockDate": "解鎖日期",
    "unlockIn": "在 {{days}} 天後解鎖",
    "contents": "內容",
    "message": "留言",
    "addToCapsule": "新增至時光膠囊"
  },
  "baby": {
    "title": "寶寶檔案",
    "name": "姓名",
    "dateOfBirth": "出生日期",
    "gender": "性別",
    "male": "男孩",
    "female": "女孩",
    "editProfile": "編輯檔案",
    "milestones": "里程碑"
  },
  "settings": {
    "title": "設定",
    "language": "語言",
    "theme": "主題",
    "light": "淺色",
    "dark": "深色",
    "notifications": "通知",
    "logout": "登出"
  }
}
```

## Using Translations

### Basic Usage

```typescript
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('timeline.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
};
```

### Nested Keys

```typescript
const Component = () => {
  const { t } = useTranslation();

  return (
    <div>
      <p>{t('auth.linkSent', { email: user.email })}</p>
      {/* Result: "Magic link sent to user@example.com" */}
    </div>
  );
};
```

### Pluralization

```typescript
const Component = () => {
  const { t } = useTranslation();

  const count = 5;

  return (
    <div>
      <p>{t('timeline.moments', { count })}</p>
      {/* In English: "5 moments" */}
    </div>
  );
};
```

**In translation file:**
```json
{
  "timeline": {
    "moments_one": "{{count}} moment",
    "moments_other": "{{count}} moments"
  }
}
```

## Date & Time Localization

### Using i18next Date Formatting

```typescript
import { useTranslation } from 'react-i18next';

const DateDisplay = ({ date }: Props) => {
  const { i18n } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat(i18n.language, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false, // 24-hour format
    }).format(date);
  };

  return (
    <div>
      <p>Date: {formatDate(dateString)}</p>
      <p>Time: {formatTime(dateString)}</p>
    </div>
  );
};
```

### Relative Time

```typescript
import { formatRelative, formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

const RelativeTime = ({ date }: Props) => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    return formatRelative(date, { locale: i18n.language });
  };

  return (
    <p>
      {getRelativeTime(dateString)}
      {/* English: "2 days ago" */}
      {/* Chinese: "2 天前" */}
    </p>
  );
};
```

## Number Formatting

### Currency

```typescript
import { useTranslation } from 'react-i18next';

const PriceDisplay = ({ amount, currency }: Props) => {
  const { i18n } = useTranslation();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency || 'USD',
    }).format(value);
  };

  return <p>{formatCurrency(amount)}</p>;
};
```

### Percentages

```typescript
const PercentileDisplay = ({ value }: Props) => {
  const { i18n } = useTranslation();

  const formatPercentile = (value: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'percent',
      maximumFractionDigits: 0,
    }).format(value / 100);
  };

  return <p>{formatPercentile(value)}th percentile</p>;
};
```

### Decimals

```typescript
const WeightDisplay = ({ value, unit }: Props) => {
  const { i18n } = useTranslation();

  const formatWeight = (weight: number) => {
    return new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(weight);
  };

  return <p>{formatWeight(value)} {unit}</p>;
};
```

## Language Switching

### Language Switcher Component

```typescript
import { useTranslation, i18n } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
  ];

  const currentLanguage = languages.find(l => l.code === i18n.language);

  return (
    <div>
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={i18n.language === lang.code ? 'active' : ''}
        >
          <span>{lang.flag}</span>
          <span>{lang.name}</span>
        </button>
      ))}
    </div>
  );
};
```

### Persisting Language

```typescript
// On app load
const initI18n = () => {
  const savedLanguage = localStorage.getItem('language') || 'en';

  i18n.changeLanguage(savedLanguage);
};

// On language change
const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
  localStorage.setItem('language', lng);
};
```

## Adding New Languages

### 1. Create Translation File

**packages/frontend/src/locales/es.json:**

```json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar"
  }
}
```

### 2. Add to Resources

```typescript
const resources = {
  en: { translation: () => import('@/locales/en.json') },
  'zh-TW': { translation: () => import('@/locales/zh-TW.json') },
  es: { translation: () => import('@/locales/es.json') }, // NEW
};
```

### 3. Update Language Switcher

```typescript
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }, // NEW
];
```

## Missing Translation Handling

### Fallback to Key

```typescript
const SafeTranslation = ({ key, options }: Props) => {
  const { t } = useTranslation();

  // Returns the key if translation not found
  const translation = t(key, options);

  return translation;
};

// Usage
<SafeTranslation key="nonexistent.key" />
// Displays: "nonexistent.key"
```

### Development Mode Warning

```typescript
const TranslationDebug = ({ key }: Props) => {
  const { t, i18n } = useTranslation();

  const translation = t(key);

  // Show missing translation warning in development
  if (import.meta.env.DEV && translation === key) {
    console.warn(`Missing translation: ${key}`);
    return (
      <div className="translation-warning">
        ⚠️ Missing: {key}
      </div>
    );
  }

  return <span>{translation}</span>;
};
```

## Namespaces (Advanced)

### Using Namespaces

**For large apps, split translations by feature:**

```typescript
const resources = {
  en: {
    common: () => import('@/locales/en/common.json'),
    timeline: () => import('@/locales/en/timeline.json'),
    growth: () => import('@/locales/en/growth.json'),
  },
  'zh-TW': {
    common: () => import('@/locales/zh-TW/common.json'),
    timeline: () => import('@/locales/zh-TW/timeline.json'),
    growth: () => import('@/locales/zh-TW/growth.json'),
  },
};
```

**Usage:**

```typescript
const Component = () => {
  const { t } = useTranslation('timeline'); // Use namespace

  return <p>{t('title')}</p>;
};
```

## RTL Support (Future)

### Adding Arabic

```typescript
// packages/frontend/src/locales/ar.json
const resources = {
  en: { translation: () => import('@/locales/en.json') },
  'zh-TW': { translation: () => import('@/locales/zh-TW.json') },
  ar: { translation: () => import('@/locales/ar.json') }, // RTL
};

// In component
const { i18n } = useTranslation();

if (i18n.dir() === 'rtl') {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = i18n.language;
}
```

## Testing

### Testing Translations

```typescript
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';

describe('Component with i18n', () => {
  it('renders translated text', () => {
    const i18nInstance = createInstance({
      lng: 'en',
      resources: {
        en: { translation: { 'button.save': 'Save' } },
      },
    });

    render(
      <I18nextProvider i18n={i18nInstance}>
        <Button />
      </I18nextProvider>
    );

    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders Chinese translation', () => {
    const i18nInstance = createInstance({
      lng: 'zh-TW',
      resources: {
        'zh-TW': { translation: { 'button.save': '儲存' } },
      },
    });

    render(
      <I18nextProvider i18n={i18nInstance}>
        <Button />
      </I18nextProvider>
    );

    expect(screen.getByText('儲存')).toBeInTheDocument();
  });
});
```

### Testing Missing Translations

```typescript
it('shows missing translation in development', () => {
  const i18nInstance = createInstance({
    lng: 'en',
    resources: { en: { translation: {} } }, // Empty
  });

  render(
    <I18nextProvider i18n={i18nInstance}>
      <Component />
    </I18nextProvider>
  );

  // In development, shows warning
  // In production, shows key
});
```

## Anti-Patterns to Avoid

### ❌ Hardcoded Strings

```typescript
// ❌ WRONG
<button>Submit</button>

// ✅ RIGHT
<button>{t('common.submit')}</button>
```

### ❌ String Concatenation

```typescript
// ❌ WRONG - breaks word order
<p>{t('hello')}, {user.name}</p>

// ✅ RIGHT - use interpolation
<p>{t('helloName', { name: user.name })}</p>

// In file
{
  "helloName": "Hello, {{name}}"
}
```

### ❌ Plural Handling Manually

```typescript
// ❌ WRONG
<p>{items.length} {items.length === 1 ? 'item' : 'items'}</p>

// ✅ RIGHT - use i18next pluralization
<p>{t('items', { count: items.length })}</p>

// In file
{
  "items_one": "{{count}} item",
  "items_other": "{{count}} items"
}
```

### ❌ Date/Time Formatting Manually

```typescript
// ❌ WRONG
<p>{date.toLocaleDateString()}</p>

// ✅ RIGHT - use i18next date formatting
<p>{formatDate(date)}</p>
```

## Key Patterns Summary

### ✅ DO:
- Use nested keys for organization
- Store translations in separate locale files
- Use interpolation for dynamic values
- Use pluralization for count-based text
- Format dates/times with `Intl.DateTimeFormat`
- Format numbers with `Intl.NumberFormat`
- Persist language in localStorage
- Show missing translation warnings in development

### ❌ DON'T:
- Hardcode English strings
- Concatenate translated strings
- Handle plurals manually
- Format dates/times manually
- Format numbers manually
- Forget to test translations
- Use large single translation file (split by namespace)
- Mix languages in same file

## Related Skills

- `react-typescript` - React/TypeScript patterns
- `pwa-specific` - Domain-specific patterns (age calc, media upload)
- `testing` - Testing patterns for i18n
