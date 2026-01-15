// Test script to verify Firestore rules are loaded correctly
// Paste this into browser console on http://localhost:5174

async function testFirestoreRules() {
  console.log('🧪 Testing Firestore Rules...\n');
  
  // Check Firebase is connected
  if (!window.firebase) {
    console.error('❌ Firebase not loaded');
    return;
  }
  
  const db = firebase.firestore();
  
  // Check if connected to emulator
  try {
    await db.collection('test').limit(1).get();
    console.log('✅ Connected to Firestore emulator');
  } catch (err) {
    console.error('❌ Firestore connection failed:', err);
    return;
  }
  
  // Check authentication
  const user = firebase.auth().currentUser;
  if (!user) {
    console.error('❌ Not authenticated - please sign in first');
    return;
  }
  
  console.log('✅ Authenticated:', user.email);
  console.log('   UID:', user.uid);
  
  // Test creating a family
  console.log('\n🔍 Testing family creation...');
  try {
    const familyRef = await db.collection('families').add({
      name: 'Test Family',
      members: {
        [user.uid]: {
          role: 'admin',
          addedAt: new Date().toISOString()
        }
      },
      createdAt: new Date().toISOString()
    });
    console.log('✅ Family created successfully!');
    console.log('   Family ID:', familyRef.id);
    
    // Clean up
    await familyRef.delete();
    console.log('✅ Test family deleted\n');
    
    console.log('🎉 All tests passed! Rules are working correctly.');
    console.log('\n💡 If onboarding still fails, try:');
    console.log('   1. Clear browser storage (Application tab)');
    console.log('   2. Refresh the page');
    console.log('   3. Try onboarding from scratch');
    
  } catch (err) {
    console.error('❌ Family creation failed:', err);
    console.log('   Code:', err.code);
    console.log('   Message:', err.message);
    
    if (err.code === 'permission-denied') {
      console.log('\n⚠️  Permission denied - rules may not have reloaded');
      console.log('   Try restarting emulators (see RESTART_EMULATORS.md)');
    }
  }
}

// Run the test
console.log('Paste this function and then run: testFirestoreRules()');
testFirestoreRules();
