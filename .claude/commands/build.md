---
description: Build frontend and Media API for production
allowed-tools: Bash(npm), Read
---

# Build Command

Your task is to: $ARGUMENTS

Build frontend and Media API for production deployment.

## Steps

1. **Clean previous builds**
   ```bash
   rm -rf packages/frontend/dist
   rm -rf packages/media-api/dist
   ```

2. **Build frontend**
   ```bash
   cd packages/frontend
   npm run build
   ```
   Output: `packages/frontend/dist/`

3. **Build Media API** (if applicable)
   ```bash
   cd packages/media-api
   npm run build
   ```
   Output: `packages/media-api/dist/`

4. **Or build from root**
   ```bash
   npm run build
   ```
   This builds both packages.

## Verify Build

Check that builds completed successfully:
- Frontend: Check `packages/frontend/dist/index.html`
- Media API: Check `packages/media-api/dist/` exists
- No TypeScript errors
- No build warnings

## Output

Report:
- Frontend build status (success/fail)
- Media API build status (success/fail)
- Build output directory
- Build time
- Any errors or warnings

## Notes

- Frontend uses Vite for fast builds
- Media API builds for Cloudflare Workers
- Production deployment: Frontend to Vercel/Netlify, API to Cloudflare
- Check environment variables are set before building

## Common Issues

**TypeScript errors:**
- Check tsconfig.json settings
- Fix type errors in source files
- Run `npm run type-check` first

**Build too large:**
- Check for unused imports
- Enable code splitting with dynamic imports
- Optimize images and assets

**Environment variables missing:**
- Check .env files exist
- Verify VITE_ prefixed variables for frontend
- Verify API variables for Media API

## Related Commands

- `/dev` - Start development servers
- `/test` - Run tests
- `/lint` - Run ESLint
- `/type-check` - Run TypeScript compiler
