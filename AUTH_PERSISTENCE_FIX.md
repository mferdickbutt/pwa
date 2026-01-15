# 🔑 Authentication Persistence Fix

## Issue
When refreshing the page in the PWA, users were getting logged out and had to go through the onboarding process again.

## Root Cause
The Firebase Auth configuration was set to use `inMemoryPersistence` when using Firebase emulators, which meant the authentication session was not persisted across page refreshes.

**Problematic code (before fix):**
```typescript
// In packages/frontend/src/lib/firebase/config.ts
if (USE_EMULATORS) {
  // Use in-memory persistence for emulator testing
  setPersistence(authInstance, inMemoryPersistence);
} else {
  // Use local persistence for production
  setPersistence(authInstance, browserLocalPersistence).catch((error) => {
    console.error('Failed to set auth persistence:', error);
  });
}
```

## Solution
Changed the authentication persistence to use `browserLocalPersistence` **even when using emulators**. This ensures that the user's session persists across page refreshes during development.

**Fixed code:**
```typescript
// In packages/frontend/src/lib/firebase/config.ts
if (USE_EMULATORS) {
  // Use local persistence even with emulators to prevent logout on refresh
  setPersistence(authInstance, browserLocalPersistence).catch((error) => {
    console.error('Failed to set auth persistence:', error);
  });
} else {
  // Use local persistence for production
  setPersistence(authInstance, browserLocalPersistence).catch((error) => {
    console.error('Failed to set auth persistence:', error);
  });
}
```

## Why This Fix Works
- `browserLocalPersistence` stores the authentication state in the browser's localStorage
- This state persists across page refreshes and browser restarts
- The fix applies to both development (with emulators) and production environments
- Users can now refresh the page without losing their authentication session

## Testing

### Local Development
1. Open the PWA at http://localhost:3001/
2. Sign in or create an account
3. Complete the onboarding process
4. Refresh the page (F5 or Cmd+R)
5. **Expected:** You should remain logged in and not see the onboarding screen again
6. **Previously:** You would be logged out and forced to go through onboarding again

### Production (after Vercel deployment completes)
1. Wait 2-3 minutes for Vercel to deploy commit `677af28`
2. Check deployment status: https://vercel.com/mferdickbutt/pwa/deployments
3. Open production app: https://timehut-pwa.vercel.app
4. Clear browser storage (Application → Local Storage → Clear)
5. Sign in or create an account
6. Complete the onboarding process
7. Refresh the page (F5 or Cmd+R)
8. **Expected:** You should remain logged in!

**Note:** Clear browser storage before testing to ensure you're testing the fix, not old cached data.

## Production Deployment

✅ **Fix committed to GitHub** (commit 677af28)
✅ **Pushed to repository: git@github.com:mferdickbutt/pwa.git**
🔄 **Vercel auto-deployment in progress** - check: https://vercel.com/mferdickbutt/pwa/deployments
🌐 **Production URL: https://timehut-pwa.vercel.app**

## Local Development Status
✅ Fix implemented in `packages/frontend/src/lib/firebase/config.ts`
✅ Firebase emulators running on ports 9099 (auth) and 8080 (firestore)
✅ Frontend dev server running on http://localhost:3001/
✅ Ready for testing (both local and production)

## Notes
- This change does not affect production behavior (it already used `browserLocalPersistence`)
- The fix only impacts development with emulators
- If you clear browser storage (localStorage/sessionStorage), you will need to sign in again (this is expected behavior)
- The onboarding process will still appear for new users or when you manually sign out

## To Revert (if needed)
If for some reason you need the old behavior with emulators, revert the change in `packages/frontend/src/lib/firebase/config.ts` and restart the dev server.
