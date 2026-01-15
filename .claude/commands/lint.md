---
description: Run ESLint on frontend code
allowed-tools: Bash(npm, eslint), Read
---

# Lint Command

Your task is to: $ARGUMENTS

Run ESLint to check code quality and style.

## Steps

1. **Lint frontend**
   ```bash
   cd packages/frontend
   npm run lint
   ```

2. **Lint Media API** (if applicable)
   ```bash
   cd packages/media-api
   npm run lint
   ```

3. **Or lint from root**
   ```bash
   npm run lint
   ```

4. **Lint specific files**
   ```bash
   cd packages/frontend
   npm run lint -- src/pages/TimelinePage.tsx
   ```

5. **Auto-fix issues** (where possible)
   ```bash
   npm run lint -- --fix
   ```

## Options

### Show warnings only
```bash
npm run lint -- --quiet
```

### Check specific rules
```bash
npm run lint -- --rule 'no-unused-vars'
```

### Generate report
```bash
npm run lint -- --format html
```

## Output

Report:
- Number of errors found
- Number of warnings found
- Which files have issues
- Summary by rule (most common issues)
- Any auto-fixable issues

## Notes

- ESLint checks for code quality, best practices, and potential bugs
- Linting rules are in `.eslintrc.js` or `eslint.config.js`
- Use `--fix` to automatically fix many issues
- Run lint before committing code

## Common Issues

**Unused variables:**
- Remove unused variables
- Or prefix with underscore `_` if intentional

**Missing semicolons:**
- Add semicolons where required
- Or use `--fix` to auto-fix

**Imports out of order:**
- Reorder imports (groups: react, third-party, local)
- Use Prettier to auto-format

**Missing TypeScript types:**
- Add type annotations for functions/variables
- Don't use `any` unless necessary

**Console.log statements:**
- Remove debug console.log from production
- Use proper logging library

## Related Commands

- `/dev` - Start development servers
- `/test` - Run tests
- `/type-check` - Run TypeScript compiler
- `/build` - Build for production
