# Onboarding Debug Guide

## Issue: "Missing or insufficient permissions" at step 2 (Family creation)

## Quick Test

1. Open browser console and run:
```javascript
// Check if authenticated
firebase.auth().currentUser
// Should return user object, not null

// Check auth token
firebase.auth().currentUser?.getIdToken()
// Should return a token string

// Try creating family manually
const db = firebase.firestore();
db.collection('families').add({
  name: 'Test Family',
  members: {
    [firebase.auth().currentUser.uid]: {
      role: 'admin',
      addedAt: new Date().toISOString()
    }
  }
}).then(doc => console.log('Success:', doc.id))
  .catch(err => console.error('Error:', err));
```

## If That Fails, Try This:

### 1. Update Firestore Rules

Updated rules are in `firebase/firestore.rules`. To apply:

```bash
cd /home/lc66/pwa/firebase
firebase emulators:start --only auth,firestore --project timehut-local
```

Rules should auto-reload when changed.

### 2. Check Firebase Auth State

In browser console:
```javascript
// Subscribe to auth changes
firebase.auth().onAuthStateChanged(user => {
  console.log('Auth state changed:', user);
});
```

### 3. Clear All Data and Try Again

1. Open Application tab in Chrome DevTools
2. Clear all local storage, session storage, cookies
3. Close tab and reopen
4. Try onboarding again

### 4. Check Network Requests

1. Open Network tab in Chrome DevTools
2. Try creating a family
3. Look for Firestore requests (firestore.googleapis.com)
4. Check request payload for auth token

## Common Issues

### Issue 1: Auth emulator not connected
**Symptom**: `firebase.auth().currentUser` is null
**Fix**: Check console for emulator connection messages:
```
[Firebase] Connected to Auth emulator at http://localhost:9099
```

### Issue 2: Firestore rules not reloading
**Symptom**: Still get permission error after updating rules
**Fix**: Restart emulators:
```bash
# Kill existing emulator (Ctrl+C)
cd /home/lc66/pwa/firebase
firebase emulators:start --only auth,firestore --project timehut-local
```

### Issue 3: User not actually authenticated
**Symptom**: `firebase.auth().currentUser` is null
**Fix**: Complete login flow before onboarding. Check `AuthPage.tsx` to ensure you're actually signing in.

### Issue 4: Request timing issue
**Symptom**: First attempt fails, retry succeeds
**Fix**: Add retry logic to `OnboardingPage.tsx` (see below)

## Updated Onboarding Code

If you need to update `OnboardingPage.tsx` to add retry:

```typescript
// Add retry function
const retryCreateFamily = async (name: string, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await createFamily(name.trim());
    } catch (err: any) {
      console.log(`Attempt ${i + 1} failed:`, err);
      if (i === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
};

// Use it in nextStep:
case 2: {
  if (!familyName.trim()) {
    setError('Please enter a family name');
    return;
  }
  setIsLoading(true);
  try {
    await retryCreateFamily(familyName.trim());
    setStep(3);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create family';
    setError(message);
  } finally {
    setIsLoading(false);
  }
  break;
}
```

## Still Not Working?

1. Check Firebase emulator logs for errors
2. Verify emulator ports: Auth (9099), Firestore (8080)
3. Try completely restarting emulators and frontend
4. Check browser console for any Firebase errors
5. Try the "Test with Test Mode" in Firestore Rules tab of emulator UI (http://localhost:4000/firestore/rules)

## Emulator UI

Access at: http://localhost:4000

- Go to Firestore → Rules
- You can test your rules with sample requests
- Check "Test with Test Mode" for debugging

## Latest Updates

- ✅ Updated Firestore rules with better validation
- ✅ Added isAuthenticated() helper function
- ✅ Added better member checking logic
- ✅ Fixed potential race conditions

## Next Steps

1. Stop current emulators (Ctrl+C)
2. Start emulators again with new rules
3. Clear browser storage
4. Try onboarding from scratch
5. Check console for detailed error messages

If still failing, share the console error output and we'll debug further!
