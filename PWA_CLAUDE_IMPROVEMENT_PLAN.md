# PWA Claude Code Improvement Plan

## Date: 2026-01-15
**Project**: TimeHut PWA (Baby Memory Book)
**Repository**: https://github.com/mferdickbutt/pwa

---

## Overview

Based on exploration of the PWA codebase and analysis of Chris Wiles' claude-code-showcase repository, this plan outlines Claude Code improvements to enhance development productivity and code quality.

---

## Current State Analysis

### Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Framer Motion
- **State Management**: Zustand
- **Backend**: Firebase (Auth, Firestore)
- **Storage**: Cloudflare R2 (prod) / MinIO (local)
- **Media API**: Cloudflare Worker (prod) / Node.js (local)
- **i18n**: react-i18next
- **Routing**: react-router-dom

### Key Features
- Timeline feed with baby age calculation
- Calendar view
- Growth tracker (WHO percentiles)
- Time capsules
- Baby profile management
- Email link authentication (passwordless)

### Code Patterns Observed
- Lazy loading with React.lazy
- Protected/Public route patterns
- Animated page transitions (Framer Motion)
- Custom hooks and Zustand stores
- Media API with presigned URLs (S3-compatible)
- Caching layer for media URLs
- i18n integration

### What's Missing
❌ No CLAUDE.md project memory
❌ No .claude directory with skills/agents/commands
❌ No testing framework
❌ No code review automation
❌ No hooks for auto-formatting/type-checking
❌ No project-specific patterns documented
❌ No ESLint configuration visible
❌ No test files found

---

## Recommendations (Ranked by Impact)

### 1. ✅ Create CLAUDE.md Project Memory
**Impact**: 🔥 HIGH
**Why**: Foundation for all other improvements; provides instant context

**Content**:
- Tech stack overview (React, TS, Vite, Firebase, Zustand)
- Architecture (monorepo with packages/frontend and packages/media-api)
- Key commands (dev, build, test, lint)
- Directory structure
- Firebase configuration
- Age calculation rules
- WHO growth data structure
- Media upload flow (presign → upload → create document → display)
- i18n patterns
- Component patterns (lazy loading, protected routes, animations)

### 2. ✅ Create React/TypeScript Skill
**Impact**: 🔥 HIGH
**Why**: Teaches project-specific React patterns

**Content**:
- Component structure (lazy loading, code splitting)
- Zustand store patterns (authStore, momentStore, capsuleStore, growthStore)
- Firebase integration (Auth, Firestore, onboarding)
- Protected/Public route patterns
- Framer Motion animation patterns
- i18n integration with react-i18next
- Type safety patterns
- Performance patterns (lazy loading, caching)

### 3. ✅ Create Testing Skill
**Impact**: 🔥 HIGH
**Why**: Currently no test framework; essential for quality

**Content**:
- Testing stack (Vitest + React Testing Library)
- Component testing patterns
- Firebase emulator testing
- Zustand store testing
- API mocking patterns
- i18n testing

### 4. ✅ Create PWA-Specific Skill
**Impact**: 🔥 HIGH
**Why**: Domain knowledge for this specific app

**Content**:
- Age calculation logic (<24mo = "X months Y days", >=24mo = "X years Y months")
- WHO percentile data structure
- Media upload flow (presign → direct upload → create document → display)
- Media caching patterns
- Firebase email link authentication
- Time capsule logic
- Family membership patterns

### 5. ✅ Create Code Review Agent
**Impact**: 🔥 HIGH
**Why**: Automated quality checks for React/Firebase/Tailwind code

**Content**:
- React best practices (hooks, performance, accessibility)
- TypeScript strict mode compliance
- Firebase security rules (Firestore, Auth)
- Tailwind CSS patterns
- Zustand store patterns
- i18n completeness
- Media upload security
- Performance considerations

### 6. ✅ Create Settings.json with Hooks
**Impact**: 🔥 HIGH
**Why**: Automates quality checks

**Hooks**:
- PreToolUse: Block edits on main branch
- PostToolUse:
  - Auto-format with Prettier
  - Type-check with tsc
  - Lint with ESLint
  - Run tests on file changes (if tests exist)

### 7. ✅ Create Development Commands
**Impact**: 🟡 MEDIUM
**Why**: Faster workflows for common tasks

**Commands**:
- `/dev` - Start all dev services (frontend + API + emulators)
- `/test` - Run all tests
- `/build` - Build frontend and API
- `/lint` - Run ESLint
- `/type-check` - Run TypeScript compiler check
- `/media-cache-clear` - Clear media URL cache

### 8. ✅ Create i18n Skill
**Impact**: 🟡 MEDIUM
**Why**: Translation patterns are complex and easy to get wrong

**Content**:
- react-i18next integration patterns
- Translation file structure (en.json, zh-TW.json)
- Date/time localization
- Number formatting
- Common translation keys
- Adding new languages

### 9. ✅ Create GitHub Actions Workflow
**Impact**: 🟡 MEDIUM
**Why**: CI/CD automation for quality gates

**Workflow**:
- Install dependencies
- Type-check (tsc)
- Lint (ESLint)
- Run tests (when available)
- Build (Vite)
- Deploy to Vercel/Cloudflare

### 10. ✅ Create Debugging Skill
**Impact**: 🟡 MEDIUM
**Why**: React/Firebase debugging can be complex

**Content**:
- React DevTools usage
- Firebase Emulator debugging
- Network debugging (Media API)
- State debugging (Zustand DevTools)
- i18n debugging (missing translations)
- Performance debugging (lazy loading, caching)

### 11. ✅ Create Component Pattern Skill
**Impact**: 🟡 MEDIUM
**Why**: Reusable component patterns

**Content**:
- Page component structure (AuthPage, TimelinePage, etc.)
- Layout components (AppShell)
- Timeline component patterns
- Growth chart patterns
- Calendar component patterns
- Form components (onboarding, baby profile)

### 12. ✅ Create Firebase Skill
**Impact**: 🟡 MEDIUM
**Why**: Firebase integration patterns are complex

**Content**:
- Auth patterns (email link, anonymous, sign out)
- Firestore patterns (CRUD operations)
- Security rules patterns
- Emulator usage
- Pagination patterns
- Real-time updates
- Offline support

---

## Testing Framework

### Test Cases

#### Test 1: Component Generation
**Prompt**: "Create a new page component for a Settings page with form fields for user preferences"

**Before Expected**:
- Claude would need to read existing pages to understand patterns
- Might miss i18n integration
- May not use proper TypeScript types
- May not include animations
- May not follow Firebase patterns

**After Expected**:
- Applies React/TypeScript skill patterns
- Includes i18n integration
- Uses proper TypeScript types
- Includes Framer Motion animations
- Follows component structure patterns
- Integrates with Zustand stores if needed

#### Test 2: Firebase Integration
**Prompt**: "Add a new field to the baby profile: favorite color (string) with Firestore integration"

**Before Expected**:
- Claude would need to read firebase files to understand patterns
- Might miss security rules considerations
- May not update TypeScript types
- May not update store properly

**After Expected**:
- Applies Firebase skill patterns
- Updates TypeScript types (BabyDocument)
- Updates Zustand store (authStore)
- Adds Firestore CRUD operations
- Follows security patterns
- Includes proper error handling

#### Test 3: Media Upload
**Prompt**: "Create a component to upload a new photo to the timeline with progress indicator"

**Before Expected**:
- Claude would need to read media.ts to understand API
- Might miss caching patterns
- May not handle errors properly
- May not use presigned URL pattern correctly

**After Expected**:
- Applies PWA skill (media upload flow)
- Uses presigned URL pattern (presign → upload → create document)
- Includes progress tracking
- Handles errors gracefully
- Uses caching patterns for display
- Follows type definitions

#### Test 4: Age Calculation
**Prompt**: "Create a utility function to display baby's age in the correct format based on DOB"

**Before Expected**:
- Claude would need to find existing age calculation logic
- Might not understand the format rules (<24mo vs >=24mo)
- May not handle i18n properly

**After Expected**:
- Applies PWA skill (age calculation rules)
- Uses correct format based on months
- Includes i18n integration
- Handles edge cases
- Follows TypeScript patterns

#### Test 5: Testing Setup
**Prompt**: "Create tests for the AuthPage component"

**Before Expected**:
- Claude would need to figure out testing framework
- Would create tests but might not follow patterns
- Might not test Firebase integration properly

**After Expected**:
- Applies Testing skill patterns
- Uses Vitest + React Testing Library
- Tests component behavior
- Mocks Firebase properly
- Tests i18n integration
- Tests error states

---

## Next Steps

1. **Create CLAUDE.md** - Foundation project memory
2. **Create skills** - React/TS, Testing, PWA, i18n, Firebase
3. **Create agent** - Code review for this stack
4. **Create commands** - Development workflow commands
5. **Create settings.json** - Hooks for automation
6. **Create GitHub Actions** - CI/CD workflow
7. **Run tests** - Before/after comparison for each improvement
8. **Document results** - Final report with impact analysis
9. **Commit changes** - All improvements to git

---

## Expected Benefits

- **Instant Context**: CLAUDE.md provides immediate project understanding
- **Consistent Patterns**: Skills ensure code follows established patterns
- **Automated Quality**: Hooks enforce type-checking, linting, formatting
- **Faster Development**: Commands streamline common workflows
- **Better Tests**: Testing skill establishes proper test patterns
- **Code Quality**: Code review agent catches issues before PR
- **CI/CD**: GitHub Actions automate quality gates

---

## File Structure After Implementation

```
/home/lc66/pwa/
├── CLAUDE.md                                    # Project memory
├── .claude/
│   ├── README.md                                  # Setup documentation
│   ├── settings.json                              # Hooks configuration
│   ├── skills/
│   │   ├── react-typescript/                      # React/TS patterns
│   │   ├── testing/                              # Testing patterns
│   │   ├── pwa-specific/                         # Domain patterns
│   │   ├── i18n/                                 # i18n patterns
│   │   ├── firebase/                              # Firebase patterns
│   │   └── component-patterns/                     # Component patterns
│   ├── agents/
│   │   └── pwa-code-reviewer.md                 # Code review agent
│   ├── commands/
│   │   ├── dev.md                                # Start all services
│   │   ├── test.md                               # Run tests
│   │   ├── build.md                              # Build everything
│   │   ├── lint.md                               # Run ESLint
│   │   ├── type-check.md                         # Type-check
│   │   └── media-cache-clear.md                 # Clear cache
│   ├── hooks/                                     # Hook scripts
│   └── rules/                                     # Modular instructions
├── .github/workflows/
│   ├── pwa-code-review.yml                       # PR review
│   ├── pwa-ci.yml                               # CI/CD
│   └── pwa-deploy.yml                           # Deployment
└── test_framework.sh                              # Testing script
```

---

## Impact Summary

| Improvement | Impact | Status |
|------------|--------|--------|
| CLAUDE.md | 🔥 HIGH | Pending |
| React/TypeScript Skill | 🔥 HIGH | Pending |
| Testing Skill | 🔥 HIGH | Pending |
| PWA-Specific Skill | 🔥 HIGH | Pending |
| Code Review Agent | 🔥 HIGH | Pending |
| Settings.json Hooks | 🔥 HIGH | Pending |
| Development Commands | 🟡 MEDIUM | Pending |
| i18n Skill | 🟡 MEDIUM | Pending |
| GitHub Actions | 🟡 MEDIUM | Pending |
| Debugging Skill | 🟡 MEDIUM | Pending |
| Component Pattern Skill | 🟡 MEDIUM | Pending |
| Firebase Skill | 🟡 MEDIUM | Pending |

**Total**: 12 improvements
**High Impact**: 6
**Medium Impact**: 6

---

## Ready to Implement!

This plan provides a comprehensive roadmap for enhancing Claude Code effectiveness on the PWA project. Each improvement will be tested with before/after analysis to measure impact.
