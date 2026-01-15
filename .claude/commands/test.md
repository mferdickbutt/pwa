---
description: Run all tests for frontend and API
allowed-tools: Bash(npm, vitest), Read
---

# Test Command

Your task is to: $ARGUMENTS

Run all tests for TimeHut PWA.

## Steps

1. **Run frontend tests**
   ```bash
   cd packages/frontend
   npm test
   ```

2. **Run API tests** (if available)
   ```bash
   cd packages/media-api
   npm test
   ```

3. **Run tests from root**
   ```bash
   npm test
   ```

4. **Check test coverage** (optional)
   ```bash
   cd packages/frontend
   npm test -- --coverage
   ```

## Options

### Run in watch mode
```bash
npm test -- --watch
```

### Run specific test file
```bash
npm test -- TimelinePage.test.tsx
```

### Run tests matching pattern
```bash
npm test -- --grep "auth"
```

## Output

Report:
- Number of tests passed
- Number of tests failed
- Test coverage percentage (if requested)
- Any errors or warnings
- Which files failed (if any)

## Notes

- Tests use Vitest + React Testing Library
- Firebase operations are mocked in tests
- Media API is mocked using MSW (Mock Service Worker)
- Test files should be in `src/__tests__/`
- Target coverage: 80%+ for components, 90%+ for stores

## Common Issues

**No tests found:**
- Create test files in `src/__tests__/`
- Follow naming convention: `ComponentName.test.tsx`

**Tests failing:**
- Check console for error messages
- Verify mocks are configured correctly
- Check test environment variables

**Coverage below target:**
- Add tests for untested code
- Refactor complex functions for better testability

## Related Commands

- `/dev` - Start development servers
- `/lint` - Run ESLint
- `/type-check` - Run TypeScript compiler
