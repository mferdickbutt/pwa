---
description: Run TypeScript compiler to check types
allowed-tools: Bash(npm, tsc), Read
---

# Type-Check Command

Your task is to: $ARGUMENTS

Run TypeScript compiler to check for type errors.

## Steps

1. **Type-check frontend**
   ```bash
   cd packages/frontend
   npm run type-check
   ```

2. **Type-check Media API** (if applicable)
   ```bash
   cd packages/media-api
   npm run type-check
   ```

3. **Or type-check from root**
   ```bash
   npm run type-check
   ```

4. **Watch for type errors** (development)
   ```bash
   cd packages/frontend
   npm run type-check -- --watch
   ```

## Options

### No emit (check only)
```bash
npm run type-check -- --noEmit
```

### Specific file
```bash
tsc --noEmit src/pages/TimelinePage.tsx
```

## Output

Report:
- Number of type errors found
- Number of files with errors
- Which files have type errors
- Description of type errors
- Any TypeScript warnings

## Notes

- TypeScript strict mode is enabled in tsconfig.json
- Type-checking prevents runtime errors
- All types must be explicitly defined (no implicit any)
- Use `import type` for type-only imports
- Check before committing code

## Common Issues

**Type 'any' assigned:**
- Define proper TypeScript interface
- Use union types for finite options
- Or use `unknown` with type guards

**Property does not exist on type:**
- Check TypeScript interface
- Add missing property to interface
- Use type assertion if necessary (but avoid)

**Parameter implicitly has 'any' type:**
- Add type annotation to parameter
- Or infer from context

**Missing type for function return:**
- Add return type annotation
- Or let TypeScript infer from usage

**Module not found:**
- Check import path is correct
- Verify module is installed
- Check `@/` path alias in tsconfig.json

## Related Commands

- `/dev` - Start development servers
- `/test` - Run tests
- `/lint` - Run ESLint
- `/build` - Build for production
