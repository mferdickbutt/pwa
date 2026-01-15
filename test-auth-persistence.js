/**
 * Test Script: Verify Authentication Persistence
 *
 * Run this in the browser console after signing in to verify
 * that authentication persists across page refreshes.
 */

console.log('🔍 Testing Authentication Persistence...\n');

// Test 1: Check if user is currently authenticated
const auth = firebase.auth();
const user = auth.currentUser;

console.log('Test 1: Current Authentication Status');
console.log('─'.repeat(50));
console.log('User:', user ? '✅ Authenticated' : '❌ Not authenticated');
if (user) {
  console.log('  UID:', user.uid);
  console.log('  Email:', user.email);
  console.log('  Email Verified:', user.emailVerified);
} else {
  console.log('  ⚠️  No user found. Please sign in first.');
}
console.log();

// Test 2: Check auth persistence setting
console.log('Test 2: Auth Persistence Setting');
console.log('─'.repeat(50));
console.log('Persistence:', auth.settings.appVerificationDisabledForTesting ? 'Testing Mode' : 'Normal Mode');
console.log('  Note: Persistence is set via browserLocalPersistence in config.ts');
console.log();

// Test 3: Check localStorage for auth tokens
console.log('Test 3: LocalStorage Auth Data');
console.log('─'.repeat(50));
const authKeys = Object.keys(localStorage).filter(key => key.includes('firebase') || key.includes('auth'));
if (authKeys.length > 0) {
  console.log('✅ Found auth data in localStorage:');
  authKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`  - ${key}:`, value ? 'Present' : 'Empty');
  });
} else {
  console.log('⚠️  No auth data found in localStorage (this might be expected if not signed in)');
}
console.log();

// Test 4: Verify current family selection
console.log('Test 4: Current Family Selection');
console.log('─'.repeat(50));
const currentFamilyId = localStorage.getItem('timehut_current_family_id');
console.log('Current Family ID:', currentFamilyId || 'None selected');
console.log();

// Test 5: Instructions for refresh test
console.log('Test 5: Refresh Persistence Test');
console.log('─'.repeat(50));
console.log('Instructions:');
console.log('1. Make sure you are signed in');
console.log('2. Complete onboarding if needed');
console.log('3. Note the current user and family above');
console.log('4. Refresh the page (F5 or Cmd+R)');
console.log('5. Run this script again');
console.log('6. Compare the results - user and family should still be present');
console.log();

console.log('✅ Test completed! Review the results above.');
