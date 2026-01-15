# 🔧 Production Deployment - Auth Persistence Fix

## What Was Fixed

**Issue**: Refreshing the page logs users out and forces onboarding again.

**Root Cause**: Firebase Auth configuration was using `inMemoryPersistence` when emulators were enabled, which doesn't persist across page refreshes.

**Fix**: Changed to always use `browserLocalPersistence` for both development and production environments.

**Code Changed**: `packages/frontend/src/lib/firebase/config.ts`

## Deployment Status

✅ **Code committed and pushed to GitHub**
- Repository: `git@github.com:mferdickbutt/pwa.git`
- Branch: `main`
- Commit: `677af28`
- Message: "fix(auth): Use browserLocalPersistence to prevent logout on refresh"

🔄 **Vercel auto-deployment should be starting**
- Vercel will detect the new commit on `main`
- Deployment URL: https://timehut-pwa.vercel.app
- Wait 2-3 minutes for deployment to complete

## Test the Fix

### Step 1: Wait for Vercel Deployment

1. Go to: https://vercel.com/mferdickbutt/pwa/deployments
2. Wait for the latest deployment (commit `677af28`) to show "Ready" status
3. This typically takes 2-3 minutes

### Step 2: Clear Browser Storage

**Important**: Clear your browser storage to test the fix properly:

**Chrome/Edge:**
1. Open DevTools (F12)
2. Go to **Application** tab
3. Expand **Local Storage** → Select your app's domain
4. Right-click → **Clear**
5. Also clear **Session Storage** and **Cookies** for the domain

**Safari:**
1. Open DevTools (Cmd+Option+I)
2. Go to **Storage** tab
3. Clear local storage and cookies for the domain

**Firefox:**
1. Open DevTools (F12)
2. Go to **Storage** tab
3. Clear local storage for the domain

### Step 3: Test the Fix

1. Go to: https://timehut-pwa.vercel.app
2. **Sign in** (or create a new account)
3. **Complete the onboarding process**
4. **Refresh the page** (F5 or Cmd+R)
5. ✅ **You should stay logged in!**

### Step 4: Verify with Debug Script

Open browser console (F12) and run:

```javascript
// Check authentication status
const user = firebase.auth().currentUser;
console.log('✅ Authenticated:', !!user);
console.log('User:', user);
console.log('UID:', user?.uid);

// Check localStorage for auth data
const authKeys = Object.keys(localStorage).filter(k => k.includes('firebase') || k.includes('auth'));
console.log('Auth data in localStorage:', authKeys.length > 0 ? '✅ Yes' : '❌ No');
console.log('Keys:', authKeys);

// Check current family
const familyId = localStorage.getItem('timehut_current_family_id');
console.log('Current family:', familyId || 'None');
```

**Expected output after refresh:**
```
✅ Authenticated: true
User: UserImpl {...}
UID: abc123...
Auth data in localStorage: ✅ Yes
Keys: [...firebase auth keys...]
Current family: xyz789...
```

**If still failing:**
```
❌ Authenticated: false
Auth data in localStorage: ❌ No
```

## If Issue Persists

If you're still getting logged out on refresh after the deployment, the issue might be:

### Possible Cause 1: Browser Privacy Settings

**Safari (iOS/macOS):**
1. Safari → Settings → Privacy → Prevent Cross-Site Tracking
2. Try disabling this temporarily
3. Or add your app to Safari's "Websites" exceptions

**Chrome:**
1. Settings → Privacy and security → Cookies and other site data
2. Make sure "Block third-party cookies" is not blocking your app

### Possible Cause 2: Incognito/Private Mode

- Private browsing mode clears localStorage when the session ends
- Test in **normal browsing mode**

### Possible Cause 3: Firebase Auth Session Issues

Run this diagnostic in browser console:

```javascript
// Comprehensive auth diagnostics
(async function diagnoseAuth() {
  console.log('🔍 Auth Diagnostic Report\n');
  
  const auth = firebase.auth();
  const app = firebase.app();
  
  // 1. Check Firebase config
  console.log('1. Firebase Configuration:');
  console.log('   Project ID:', app.options.projectId);
  console.log('   App ID:', app.options.appId);
  console.log('   Auth Domain:', app.options.authDomain);
  
  // 2. Check current auth state
  console.log('\n2. Current Auth State:');
  const user = auth.currentUser;
  console.log('   User:', user ? '✅ Present' : '❌ Null');
  if (user) {
    console.log('   Email:', user.email);
    console.log('   UID:', user.uid);
    console.log('   Email Verified:', user.emailVerified);
    console.log('   Provider:', user.providerData[0]?.providerId);
  }
  
  // 3. Check auth persistence
  console.log('\n3. Auth Persistence:');
  console.log('   Setting: browserLocalPersistence (expected)');
  console.log('   LocalStorage auth data:', 
    Object.keys(localStorage).filter(k => k.includes('firebase')).length > 0 ? '✅ Present' : '❌ Missing'
  );
  
  // 4. Test token refresh
  if (user) {
    console.log('\n4. Testing Auth Token:');
    try {
      const token = await user.getIdToken();
      console.log('   ✅ Token retrieved');
      console.log('   Length:', token.length);
      console.log('   First 50 chars:', token.substring(0, 50) + '...');
      
      const refreshedToken = await user.getIdToken(true);
      console.log('   ✅ Token refreshed successfully');
      
    } catch (err) {
      console.error('   ❌ Token error:', err);
    }
  }
  
  // 5. Test auth state listener
  console.log('\n5. Auth State Listener:');
  let listenerCount = 0;
  const unsubscribe = auth.onAuthStateChanged((u) => {
    listenerCount++;
    console.log(`   🔄 Auth state changed (${listenerCount}x):`, u ? 'User present' : 'User null');
  });
  
  setTimeout(() => {
    unsubscribe();
    console.log('\n6. Diagnostic Complete');
    console.log('💡 Share this output with developer if issue persists');
  }, 1000);
})();
```

**Share the complete output with me!**

## Verification Steps

### ✅ Success Indicators

1. User remains signed in after page refresh
2. No redirect to `/auth` or `/onboarding`
3. `firebase.auth().currentUser` returns user object (not null)
4. `localStorage` contains Firebase auth data
5. Current family ID is preserved

### ❌ Failure Indicators

1. User is redirected to `/auth` after refresh
2. `firebase.auth().currentUser` is null
3. `localStorage` is empty or missing Firebase data
4. Have to complete onboarding again

## Deployment Monitoring

Monitor the deployment at:
- Vercel Dashboard: https://vercel.com/mferdickbutt/pwa/deployments
- Live App: https://timehut-pwa.vercel.app

## What Changed in the Code

**Before:**
```typescript
if (USE_EMULATORS) {
  setPersistence(authInstance, inMemoryPersistence);  // ❌ Doesn't persist
} else {
  setPersistence(authInstance, browserLocalPersistence);
}
```

**After:**
```typescript
if (USE_EMULATORS) {
  setPersistence(authInstance, browserLocalPersistence);  // ✅ Persists
} else {
  setPersistence(authInstance, browserLocalPersistence);
}
```

**Impact:** Now both development and production use `browserLocalPersistence`, ensuring consistent behavior.

## Next Steps

1. ✅ Wait for Vercel deployment to complete
2. ✅ Clear browser storage
3. ✅ Test the fix by signing in and refreshing
4. ✅ Run debug script to verify
5. ✅ Report back if issue persists with diagnostic output

## Contact

If the issue persists after deployment and testing:
1. Run the comprehensive diagnostic script above
2. Share the complete console output
3. Include: browser type, OS, and any privacy settings
4. Share screenshots of the issue if helpful
