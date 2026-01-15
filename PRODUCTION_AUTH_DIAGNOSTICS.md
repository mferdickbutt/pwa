# 🔍 Production Auth Diagnostics

## Run This Script in Production App Console

Open https://timehut-pwa.vercel.app and press F12 to open DevTools, then run:

```javascript
(async function productionAuthDiagnostic() {
  console.log('🔍 Production Auth Diagnostic Report\n');
  console.log('='.repeat(60));

  // Test 1: Check Firebase Initialization
  console.log('\n📦 Test 1: Firebase Initialization');
  console.log('-'.repeat(60));
  if (!window.firebase) {
    console.error('❌ Firebase not loaded!');
    return;
  }

  const app = firebase.app();
  console.log('✅ Firebase app loaded');
  console.log('   Project ID:', app.options.projectId);
  console.log('   App ID:', app.options.appId);
  console.log('   Auth Domain:', app.options.authDomain);

  // Test 2: Check Auth Configuration
  console.log('\n⚙️  Test 2: Auth Configuration');
  console.log('-'.repeat(60));
  const auth = firebase.auth();
  console.log('✅ Auth instance exists');

  // Check if persistence was set correctly
  console.log('   Persistence setting (should be browserLocalPersistence)');

  // Test 3: Check Current Auth State
  console.log('\n👤 Test 3: Current Auth State');
  console.log('-'.repeat(60));
  const user = auth.currentUser;

  if (user) {
    console.log('✅ User is authenticated');
    console.log('   UID:', user.uid);
    console.log('   Email:', user.email);
    console.log('   Email Verified:', user.emailVerified);
    console.log('   Provider:', user.providerData[0]?.providerId);
    console.log('   Creation Time:', new Date(user.metadata.creationTime).toLocaleString());
    console.log('   Last Sign-in:', new Date(user.metadata.lastSignInTime).toLocaleString());
  } else {
    console.log('❌ No user currently authenticated');
    console.log('   This is why you get logged out on refresh!');
  }

  // Test 4: Check LocalStorage for Firebase Auth Data
  console.log('\n💾 Test 4: LocalStorage Auth Data');
  console.log('-'.repeat(60));

  const allKeys = Object.keys(localStorage);
  const firebaseKeys = allKeys.filter(k =>
    k.toLowerCase().includes('firebase') ||
    k.toLowerCase().includes('auth')
  );

  console.log('Total localStorage keys:', allKeys.length);
  console.log('Firebase-related keys:', firebaseKeys.length);

  if (firebaseKeys.length > 0) {
    console.log('✅ Found Firebase auth data in localStorage:');
    firebaseKeys.forEach(key => {
      const value = localStorage.getItem(key);
      const preview = value ? value.substring(0, 50) + '...' : '(empty)';
      console.log(`   - ${key}: ${preview}`);
    });
  } else {
    console.log('❌ No Firebase auth data found in localStorage');
    console.log('   This is the problem! Auth data is not being persisted.');
  }

  // Test 5: Check for Current Family Selection
  console.log('\n🏠 Test 5: Current Family Selection');
  console.log('-'.repeat(60));
  const familyId = localStorage.getItem('timehut_current_family_id');
  console.log('Current Family ID:', familyId || 'None');

  // Test 6: Test Auth Token
  console.log('\n🔑 Test 6: Auth Token Test');
  console.log('-'.repeat(60));

  if (user) {
    try {
      const token = await user.getIdToken();
      console.log('✅ Successfully retrieved auth token');
      console.log('   Token length:', token.length);
      console.log('   Token preview:', token.substring(0, 80) + '...');

      // Test token refresh
      const refreshedToken = await user.getIdToken(true);
      console.log('✅ Successfully refreshed auth token');
      console.log('   New token length:', refreshedToken.length);

    } catch (error) {
      console.error('❌ Failed to get auth token:', error);
    }
  } else {
    console.log('⚠️  Cannot test token - no user authenticated');
  }

  // Test 7: Listen for Auth State Changes
  console.log('\n👂 Test 7: Auth State Listener');
  console.log('-'.repeat(60));
  console.log('Listening for auth state changes (5 seconds)...');

  let changeCount = 0;
  const unsubscribe = auth.onAuthStateChanged((u) => {
    changeCount++;
    console.log(`   [${changeCount}] Auth state changed:`, u ? 'User present' : 'User null');
  });

  setTimeout(() => {
    unsubscribe();
    console.log('   Listener removed after 5 seconds');

    // Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('='.repeat(60));

    const issues = [];

    if (!user) {
      issues.push('❌ User not authenticated - you will be logged out on refresh');
    }

    if (firebaseKeys.length === 0) {
      issues.push('❌ No auth data in localStorage - persistence is not working');
    }

    if (!familyId && user) {
      issues.push('⚠️  No family selected - you may need to complete onboarding');
    }

    if (issues.length === 0) {
      console.log('✅ All tests passed! Auth should persist on refresh.');
    } else {
      console.log('\n⚠️  ISSUES FOUND:');
      issues.forEach(issue => console.log(issue));
      console.log('\n💡 SHARE THIS ENTIRE OUTPUT WITH THE DEVELOPER');
    }

    console.log('\n' + '='.repeat(60));
    console.log('📝 Instructions for Next Steps:');
    console.log('1. Take a screenshot of this entire console output');
    console.log('2. Copy and paste the output to the developer');
    console.log('3. If you see issues above, the fix is not working correctly');
    console.log('='.repeat(60));

  }, 5000);
})();
```

## What This Script Checks

1. ✅ Firebase app initialization
2. ⚙️  Auth configuration
3. 👤 Current auth state
4. 💾 LocalStorage for auth data persistence
5. 🏠 Current family selection
6. 🔑 Auth token retrieval and refresh
7. 👂 Auth state listener
8. 📊 Summary with issues

## After Running the Script

**Share the complete console output with me!**

Look for:
- ❌ If you see "No user currently authenticated" - this is why you're getting logged out
- ❌ If you see "No Firebase auth data found in localStorage" - persistence is broken
- ✅ If you see "All tests passed" - something else is wrong, share the output

## Quick Check (Before Running Full Script)

You can also run this quick check:

```javascript
console.log('User:', firebase.auth().currentUser);
console.log('LocalStorage keys:', Object.keys(localStorage).filter(k => k.includes('firebase')));
```

If it shows:
- `User: null` - You're not authenticated
- `LocalStorage keys: []` - Auth data is not being persisted

**This is the problem that needs to be fixed!**
