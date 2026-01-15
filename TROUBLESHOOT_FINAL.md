# 🔥 Still Getting Permission Errors? Try These Steps

## Quick Tests

### Test 1: Use Simple Rules (Only checks auth)

Copy and paste this into Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null && request.auth.uid != null;
    }
    
    match /families/{familyId} {
      // Create: Any authenticated user
      allow create: if isAuthenticated();
      
      // Read: Any authenticated user
      allow read: if isAuthenticated();
      
      // Write: Any authenticated user
      allow write: if isAuthenticated();
      
      match /members/{uid} {
        allow read, write: if isAuthenticated();
      }
      
      match /babies/{babyId} {
        allow read, write: if isAuthenticated();
        match /{document=**} {
          allow read, write: if isAuthenticated();
        }
      }
    }
    
    match /{document=**} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

**Click Publish** and try onboarding.

---

### Test 2: Check Email Verification

1. Go to Firebase Console → Authentication
2. Find your user account
3. Check if email is **verified** (look for email icon with checkmark)
4. If NOT verified:
   - Click on user
   - Click "Send verification email"
   - Click link in email
   - Wait for it to update in Console
5. Try onboarding again

---

### Test 3: Check Firebase Project

1. Go to Firebase Console (top left)
2. Make sure selected project is: **baby-47-ec18b**
3. If wrong project selected, switch it
4. Try onboarding again

---

### Test 4: Run Debug Script Again

1. Go to your production app
2. Open DevTools → Console
3. Run `debug-production.js` script
4. Look for this line: `Email Verified: true`

If it says `false`, your email isn't verified.

---

### Test 5: Check Firestore is Enabled

1. Go to Firebase Console → Firestore Database
2. Make sure database is **created** (not "Create Database" button)
3. Make sure it's in **production mode** (not test mode)
4. Try onboarding again

---

### Test 6: Incognito Mode

1. Open app in **incognito/private window**
2. Sign in fresh
3. Try onboarding
4. This rules out browser cache issues

---

## Most Likely Issue: Email Verification

In production Firebase, you often need **email verified** to write to Firestore, even for authenticated users.

**Check this first!**

---

## What To Share With Me

If simple rules above still fail, run this in browser console and share output:

```javascript
// Get complete Firebase info
const app = firebase.app();
const auth = firebase.auth();
const user = auth.currentUser;
const db = firebase.firestore();

console.log('=== FIREBASE INFO ===');
console.log('App ID:', app.options.appId);
console.log('Project ID:', app.options.projectId);
console.log('Auth Domain:', app.options.authDomain);
console.log('\n=== AUTH INFO ===');
console.log('User:', user);
console.log('Email:', user?.email);
console.log('UID:', user?.uid);
console.log('Email Verified:', user?.emailVerified);
console.log('Provider:', user?.providerData?.[0]?.providerId);

// Try to get token
if (user) {
  user.getIdToken().then(token => {
    console.log('\n=== TOKEN INFO ===');
    console.log('Has token:', !!token);
    console.log('Token length:', token?.length);
    console.log('First 100 chars:', token?.substring(0, 100));
  }).catch(err => {
    console.error('Failed to get token:', err);
  });
}
```

**Share complete output with me!**

---

## Order to Try:

1. ✅ Check email is verified in Firebase Console
2. ✅ Use simple rules above (just check auth)
3. ✅ Run debug script and share output
4. ✅ Try incognito mode
5. ✅ Check Firebase project matches config

---

If none of this works, share:
1. Complete debug script output
2. Screenshot of Firebase Console Rules tab
3. Screenshot of Firebase Console Authentication tab
4. Exact error message from browser console
