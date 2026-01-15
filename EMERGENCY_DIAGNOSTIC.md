# 🔥 Emergency Diagnostic - Run This Now

## Instructions

1. Go to **https://timehut-pwa.vercel.app**
2. **Sign in** and complete onboarding
3. Press **F12** to open DevTools
4. Go to **Console** tab
5. **Copy and paste** the script below
6. **Press Enter**
7. **Refresh the page** (F5)
8. **Take a screenshot** of the console output
9. **Send me the screenshot**

## The Script

```javascript
// ============================================================
// COMPLETE PRODUCTION AUTH DIAGNOSTIC
// ============================================================

console.clear();
console.log('🔍 PRODUCTION AUTH DIAGNOSTIC');
console.log('='.repeat(70));

async function runDiagnostic() {
  const results = {
    firebaseLoaded: false,
    userBeforeRefresh: null,
    userAfterRefresh: null,
    localStorageBefore: [],
    localStorageAfter: [],
    persistenceSet: false,
    errors: []
  };

  try {
    // Test 1: Check Firebase
    console.log('\n📦 Test 1: Firebase Initialization');
    console.log('-'.repeat(70));
    if (!window.firebase) {
      console.error('❌ Firebase not loaded!');
      results.errors.push('Firebase not loaded');
      return results;
    }
    console.log('✅ Firebase loaded');

    const app = firebase.app();
    console.log('   Project:', app.options.projectId);
    console.log('   App ID:', app.options.appId);
    results.firebaseLoaded = true;

    // Test 2: Check current auth state
    console.log('\n👤 Test 2: Current Auth State (BEFORE refresh)');
    console.log('-'.repeat(70));
    const auth = firebase.auth();
    const user = auth.currentUser;
    console.log('   User:', user ? '✅ Present' : '❌ Null');
    if (user) {
      console.log('     UID:', user.uid);
      console.log('     Email:', user.email);
      console.log('     Email Verified:', user.emailVerified);
      results.userBeforeRefresh = {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      };
    } else {
      results.errors.push('No user before refresh');
    }

    // Test 3: Check localStorage
    console.log('\n💾 Test 3: LocalStorage (BEFORE refresh)');
    console.log('-'.repeat(70));
    const allKeys = Object.keys(localStorage);
    const firebaseKeys = allKeys.filter(k =>
      k.toLowerCase().includes('firebase') ||
      k.toLowerCase().includes('auth')
    );
    console.log('   Total keys:', allKeys.length);
    console.log('   Firebase keys:', firebaseKeys.length);

    if (firebaseKeys.length > 0) {
      console.log('   ✅ Found Firebase data:');
      firebaseKeys.forEach(key => {
        const value = localStorage.getItem(key);
        const preview = value ? value.substring(0, 60) + '...' : '(empty)';
        console.log('     -', key, ':', preview);
      });
      results.localStorageBefore = firebaseKeys;
    } else {
      console.log('   ❌ NO Firebase auth data in localStorage!');
      results.errors.push('No auth data in localStorage before refresh');
    }

    // Test 4: Listen for auth state changes
    console.log('\n👂 Test 4: Auth State Listener');
    console.log('-'.repeat(70));
    console.log('   Listening for auth state changes...');
    console.log('   🔄 Now refresh the page (F5)');

    let changes = 0;
    const unsubscribe = auth.onAuthStateChanged((u) => {
      changes++;
      console.log(`\n   🔄 Auth state change #${changes}:`);
      console.log('      User:', u ? 'Present' : 'Null');
      if (u) {
        console.log('      UID:', u.uid);
      }

      // Capture state after refresh
      if (changes > 1) {
        results.userAfterRefresh = u ? {
          uid: u.uid,
          email: u.email
        } : null;

        const afterKeys = Object.keys(localStorage).filter(k =>
          k.toLowerCase().includes('firebase') ||
          k.toLowerCase().includes('auth')
        );
        results.localStorageAfter = afterKeys;

        console.log('\n💾 Test 5: LocalStorage (AFTER refresh)');
        console.log('-'.repeat(70));
        console.log('   Firebase keys:', afterKeys.length);
        if (afterKeys.length === 0) {
          console.log('   ❌ NO Firebase auth data in localStorage!');
          results.errors.push('No auth data in localStorage after refresh');
        } else {
          console.log('   ✅ Firebase data present');
        }

        // Final summary
        setTimeout(() => {
          unsubscribe();
          printSummary(results);
        }, 500);
      }
    });

    // Set up beforeunload listener
    window.addEventListener('beforeunload', () => {
      console.log('\n🔄 Page refreshing...');
      console.log('   👆 Take a screenshot NOW after page loads!');
    });

  } catch (error) {
    console.error('\n❌ Diagnostic failed:', error);
    results.errors.push('Diagnostic error: ' + error.message);
  }

  return results;
}

function printSummary(results) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(70));

  console.log('\n✅ What Worked:');
  console.log('   - Firebase loaded:', results.firebaseLoaded ? '✅' : '❌');
  if (results.userBeforeRefresh) {
    console.log('   - User authenticated before refresh: ✅');
  }

  console.log('\n❌ What Failed:');
  results.errors.forEach(error => {
    console.log('   -', error);
  });

  console.log('\n🔍 Key Findings:');

  if (!results.userBeforeRefresh) {
    console.log('   ⚠️  You are NOT signed in!');
    console.log('   💡 Please sign in first, then run this script again');
  } else if (!results.userAfterRefresh) {
    console.log('   ⚠️  User was lost after refresh!');
    console.log('   💡 This is the bug we\'re trying to fix');
  } else if (results.localStorageBefore.length === 0) {
    console.log('   ⚠️  NO auth data in localStorage BEFORE refresh');
    console.log('   💡 Persistence is not saving auth data');
  } else if (results.localStorageAfter.length === 0) {
    console.log('   ⚠️  Auth data was in localStorage but LOST after refresh');
    console.log('   💡 This is the bug - localStorage should persist');
  } else {
    console.log('   ✅ Auth data persisted in localStorage');
  }

  console.log('\n📝 Instructions:');
  console.log('   1. Take a screenshot of this entire console output');
  console.log('   2. Send the screenshot to the developer');
  console.log('   3. Include your browser type and version');

  console.log('\n' + '='.repeat(70));
  console.log('🖼️  SCREENSHOT THIS ENTIRE OUTPUT NOW');
  console.log('='.repeat(70));
}

// Run the diagnostic
runDiagnostic();
```

## What This Script Does

1. Checks if Firebase is loaded
2. Records auth state BEFORE refresh
3. Checks localStorage BEFORE refresh
4. Sets up listener to capture auth state AFTER refresh
5. Checks localStorage AFTER refresh
6. Provides detailed summary

## After Running

**Take a screenshot of the console output and send it to me!**

The script will wait for you to refresh, then show you exactly what's happening.
