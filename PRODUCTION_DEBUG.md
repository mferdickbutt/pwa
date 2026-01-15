# Production Onboarding Debug Guide

## Problem: "Missing or insufficient permissions" in production

## Step 1: Check Firebase Console Rules

1. Go to: https://console.firebase.google.com/
2. Select project: `baby-47-ec18b`
3. Go to: **Firestore Database → Rules** tab
4. **Copy current rules** and paste somewhere safe
5. **Replace with rules below** (one of the versions)

## Step 2: Try Ultra-Permissive Rules First

If onboarding fails with the rules I gave you, try these **ultra-permissive** rules that allow everything:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Temporary debug rules - allow everything
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

This will tell us if it's:
- ✅ A rules issue → This should work
- ❌ Something else (auth, config, etc.) → This won't work either

## Step 3: Debug with Browser Console

1. Go to your production app
2. Open Chrome DevTools → Console
3. Run this:

```javascript
// Check Firebase config
console.log('Firebase Config:', firebase.app().options);

// Check if authenticated
const user = firebase.auth().currentUser;
console.log('User:', user);
console.log('UID:', user?.uid);
console.log('Email:', user?.email);
console.log('Is Email Verified:', user?.emailVerified);

// Check Firestore connection
const db = firebase.firestore();
console.log('Firestore:', db);
console.log('App ID:', firebase.app().options.appId);

// Try to get ID token
if (user) {
  user.getIdToken().then(token => {
    console.log('Auth Token (first 50 chars):', token.substring(0, 50) + '...');
  }).catch(err => {
    console.error('Failed to get ID token:', err);
  });
}
```

**Share the output with me!**

## Step 4: Test Family Creation Manually

In browser console:

```javascript
const db = firebase.firestore();
const user = firebase.auth().currentUser;

if (!user) {
  console.error('❌ Not authenticated - please sign in first');
} else {
  console.log('✅ Creating test family...');
  
  db.collection('families').add({
    name: 'Debug Test Family',
    members: {
      [user.uid]: {
        role: 'admin',
        addedAt: new Date().toISOString()
      }
    },
    createdAt: new Date().toISOString()
  })
  .then(doc => {
    console.log('✅ Success! Family ID:', doc.id);
    // Clean up
    return doc.delete();
  })
  .then(() => {
    console.log('✅ Test family deleted');
  })
  .catch(err => {
    console.error('❌ Failed:', err);
    console.error('   Code:', err.code);
    console.error('   Message:', err.message);
    console.error('   Details:', JSON.stringify(err));
  });
}
```

**Share the complete error output with me!**

## Step 5: Check Production Environment

1. Go to your production build
2. Open Chrome DevTools → Network tab
3. Try creating a family
4. Look for request to: `firestore.googleapis.com`
5. Click the request → Look at **Headers** → **Authorization**
6. Should have: `Bearer eyJhbGciOiJIUzI1NiIs...`
7. If missing: Auth token isn't being sent

## Step 6: Check Firebase Console for User

1. Go to Firebase Console → Authentication
2. Look for your email account
3. Check:
   - Email is verified?
   - Account is enabled?
   - Account is not disabled?

## Step 7: Try Different Firebase Project

If none of the above works:

1. Create a new Firebase project in Console
2. Update `.env.production` with new project IDs
3. Deploy new build
4. Test onboarding

This rules out project-specific issues.

## Common Production Issues

### Issue 1: Rules not published
**Symptom**: Updated rules locally but still get errors in production
**Fix**: Go to Firebase Console → Firestore → Rules → Click **Publish**

### Issue 2: Wrong Firebase project
**Symptom**: Production app points to different Firebase project
**Fix**: Check `.env.production` → `VITE_FIREBASE_PROJECT_ID` matches your console project

### Issue 3: Auth token not sent
**Symptom**: User is authenticated in app but Firestore doesn't see it
**Fix**: Check Network tab → Look for Authorization header in Firestore requests

### Issue 4: User email not verified
**Symptom**: Auth works but Firestore rejects writes
**Fix**: In Firebase Console → Authentication → Find user → Click ⋮ → Verify email

### Issue 5: App uses different Firebase instance
**Symptom**: Auth app and Firestore app are different instances
**Fix**: Ensure both use `firebase.app()` (single Firebase app instance)

## Quick Diagnostic Commands

Paste this into browser console on production:

```javascript
(async function debugOnboarding() {
  console.log('🔍 Debugging Production Onboarding...\n');
  
  // Check Firebase
  if (!window.firebase) {
    console.error('❌ Firebase not loaded');
    return;
  }
  
  const app = firebase.app();
  console.log('✅ Firebase App ID:', app.options.appId);
  console.log('   Project ID:', app.options.projectId);
  console.log('   Auth Domain:', app.options.authDomain);
  
  // Check Auth
  const auth = firebase.auth();
  const user = auth.currentUser;
  
  if (!user) {
    console.error('❌ Not authenticated');
    console.log('💡 Please sign in first');
    return;
  }
  
  console.log('✅ Authenticated');
  console.log('   Email:', user.email);
  console.log('   UID:', user.uid);
  console.log('   Email Verified:', user.emailVerified);
  
  // Check Firestore
  const db = firebase.firestore();
  console.log('✅ Firestore initialized');
  
  // Test write
  console.log('\n🧪 Testing family creation...');
  
  try {
    const docRef = await db.collection('families').add({
      name: 'Debug Family',
      createdAt: new Date().toISOString()
    });
    
    console.log('✅ Success! Family ID:', docRef.id);
    
    // Clean up
    await docRef.delete();
    console.log('✅ Test family deleted');
    
    console.log('\n🎉 All tests passed!');
    console.log('💡 If onboarding still fails, share console output with developer');
    
  } catch (err) {
    console.error('❌ Failed:', err);
    console.error('   Code:', err.code);
    console.error('   Message:', err.message);
    
    if (err.code === 'permission-denied' || err.code === 'unauthenticated') {
      console.log('\n⚠️  Permission denied - likely a rules issue');
      console.log('💡 Try the ultra-permissive rules above');
    }
  }
})();
```

## Next Steps

1. Run the diagnostic function above in browser console
2. Share the **complete output** with me
3. Try the ultra-permissive rules first
4. If that works, we know it's a rules issue
5. If it fails even with permissive rules, it's something else

## Files to Check

- `.env.production` → Firebase config
- `firebase/firestore.rules` → Local rules (for development)
- Firebase Console → Production rules (what's actually running)
