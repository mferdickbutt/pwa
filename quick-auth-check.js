// Quick diagnostic script for production auth issue
// Run this in the browser console on https://timehut-pwa.vercel.app

console.log('🔍 Quick Auth Check\n');

// 1. Check if user is authenticated
const user = firebase.auth().currentUser;
console.log('1. Current User:', user ? '✅ Authenticated' : '❌ Not authenticated');
if (user) {
  console.log('   UID:', user.uid);
  console.log('   Email:', user.email);
}

// 2. Check localStorage for auth data
const authKeys = Object.keys(localStorage).filter(k =>
  k.toLowerCase().includes('firebase') ||
  k.toLowerCase().includes('auth')
);
console.log('\n2. LocalStorage Auth Data:', authKeys.length > 0 ? '✅ Found' : '❌ Not found');
if (authKeys.length > 0) {
  console.log('   Keys:', authKeys);
} else {
  console.log('   ⚠️  This is why you get logged out on refresh!');
}

// 3. Check family selection
const familyId = localStorage.getItem('timehut_current_family_id');
console.log('\n3. Current Family:', familyId || 'None');

// 4. Check Firebase config
console.log('\n4. Firebase Config:');
console.log('   Project ID:', firebase.app().options.projectId);
console.log('   App ID:', firebase.app().options.appId);

// 5. Test persistence
console.log('\n5. Testing auth state changes...');
firebase.auth().onAuthStateChanged((u) => {
  console.log('   Auth state changed:', u ? 'User present' : 'User null');
  console.log('   💡 If you see "User null" on refresh, persistence is not working');
});

console.log('\n⚠️  SHARE THIS OUTPUT WITH THE DEVELOPER!');
