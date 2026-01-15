// Production Debug Script - Copy this and paste into browser console on your production app
// This will show exactly what's happening with Firebase Auth and Firestore

(function() {
  console.log('🔍 Production Onboarding Debug Script\n');
  console.log('=' .repeat(60) + '\n');
  
  // Check Firebase
  if (!window.firebase) {
    console.error('❌ Firebase not loaded!');
    console.log('💡 Check that Firebase SDK is included in your build');
    return;
  }
  
  console.log('✅ Firebase SDK loaded');
  
  // Check Firebase App
  let app;
  try {
    app = firebase.app();
    console.log('✅ Firebase App initialized');
    console.log('   App ID:', app.options.appId);
    console.log('   Project ID:', app.options.projectId);
    console.log('   Auth Domain:', app.options.authDomain);
  } catch (err) {
    console.error('❌ Failed to get Firebase app:', err);
    return;
  }
  
  // Check Auth
  let auth;
  let user;
  try {
    auth = firebase.auth();
    user = auth.currentUser;
    
    if (!user) {
      console.error('❌ Not authenticated!');
      console.log('💡 Please sign in first');
      console.log('   Go to:', window.location.origin + '/auth');
      return;
    }
    
    console.log('✅ Authenticated');
    console.log('   Email:', user.email);
    console.log('   UID:', user.uid);
    console.log('   Email Verified:', user.emailVerified);
    console.log('   Provider:', user.providerData[0]?.providerId);
  } catch (err) {
    console.error('❌ Failed to check authentication:', err);
    return;
  }
  
  // Check Firestore
  let db;
  try {
    db = firebase.firestore();
    console.log('✅ Firestore initialized');
    console.log('   Using emulator:', db.app.name === '[DEFAULT]' ? false : db.app.name);
  } catch (err) {
    console.error('❌ Failed to initialize Firestore:', err);
    return;
  }
  
  // Test connection
  console.log('\n🧪 Testing Firestore connection...');
  try {
    const testQuery = db.collection('families').limit(1);
    await testQuery.get();
    console.log('✅ Firestore connection successful');
  } catch (err) {
    console.error('❌ Firestore connection failed:', err);
    console.log('   Code:', err.code);
    console.log('   Message:', err.message);
    console.log('\n💡 Possible causes:');
    console.log('   1. Firestore not enabled in Firebase Console');
    console.log('   2. Wrong project ID in config');
    console.log('   3. Network connectivity issues');
    return;
  }
  
  // Test family creation
  console.log('\n📝 Testing family creation...');
  console.log('Sending data:');
  const testData = {
    name: 'Debug Test Family',
    members: {
      [user.uid]: {
        role: 'admin',
        addedAt: new Date().toISOString()
      }
    },
    createdAt: new Date().toISOString()
  };
  console.log('   name:', testData.name);
  console.log('   members:', JSON.stringify(testData.members, null, 2));
  console.log('   createdAt:', testData.createdAt);
  
  try {
    const docRef = await db.collection('families').add(testData);
    console.log('✅ Family created successfully!');
    console.log('   Family ID:', docRef.id);
    console.log('   Path:', docRef.path);
    
    // Clean up
    console.log('\n🧹 Cleaning up test family...');
    await docRef.delete();
    console.log('✅ Test family deleted');
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('=' .repeat(60));
    console.log('\n💡 If onboarding still fails:');
    console.log('   1. It\'s likely a UI/state issue, not rules');
    console.log('   2. Try clearing browser cache and cookies');
    console.log('   3. Try in incognito mode');
    console.log('   4. Check browser console for other errors');
    console.log('   5. Share complete error with developer');
    
  } catch (err) {
    console.error('❌ Family creation failed!');
    console.error('   Code:', err.code);
    console.error('   Message:', err.message);
    console.error('   Full Error:', JSON.stringify(err, null, 2));
    
    console.log('\n⚠️  ANALYSIS:\n');
    
    if (err.code === 'permission-denied') {
      console.log('❌ PERMISSION DENIED');
      console.log('💡 This is a Firestore Security Rules issue');
      console.log('   Current rules are too restrictive');
      console.log('   SOLUTION: Update rules in Firebase Console');
      console.log('   Try ultra-permissive rules first:');
      console.log('   rules_version = "2";');
      console.log('   service cloud.firestore {');
      console.log('     match /databases/{database}/documents {');
      console.log('       match /{document=**} {');
      console.log('         allow read, write: if true;');
      console.log('       }');
      console.log('     }');
      console.log('   }');
    } else if (err.code === 'unauthenticated') {
      console.log('❌ UNAUTHENTICATED');
      console.log('💡 User is not properly authenticated');
      console.log('   SOLUTION: Check if user is signed in');
      console.log('   SOLUTION: Check if email is verified');
      console.log('   SOLUTION: Check if auth token is being sent');
    } else if (err.code === 'not-found') {
      console.log('❌ NOT FOUND');
      console.log('💡 Firestore or collection doesn\'t exist');
      console.log('   SOLUTION: Enable Firestore in Firebase Console');
      console.log('   SOLUTION: Create Firestore database');
    } else if (err.code === 'already-exists') {
      console.log('❌ ALREADY EXISTS');
      console.log('💡 Document with this data already exists');
      console.log('   SOLUTION: Use different test data');
    } else if (err.code === 'resource-exhausted') {
      console.log('❌ RESOURCE EXHAUSTED');
      console.log('💡 Rate limit exceeded');
      console.log('   SOLUTION: Wait and try again');
    } else {
      console.log('❌ UNKNOWN ERROR');
      console.log('💡 Share this error with developer for analysis');
    }
    
    console.log('\n' + '=' .repeat(60));
  }
})();
