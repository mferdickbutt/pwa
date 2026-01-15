#!/bin/bash

echo "🔄 Restarting Firebase emulators with updated rules..."

# Kill existing emulators
pkill -f "firebase emulators"
sleep 2

# Start emulators
cd /home/lc66/pwa/firebase
echo "🚀 Starting Firebase emulators..."
npx firebase emulators:start --only auth,firestore --project timehut-local &

# Wait for emulators to be ready
echo "⏳ Waiting for emulators to start..."
sleep 5

# Check if they're running
if curl -s http://localhost:9099 > /dev/null; then
    echo "✅ Auth emulator ready (port 9099)"
else
    echo "❌ Auth emulator not ready"
    exit 1
fi

if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ Firestore emulator ready (port 8080)"
else
    echo "❌ Firestore emulator not ready"
    exit 1
fi

echo ""
echo "🎉 Firebase emulators are running!"
echo "   Auth: http://localhost:9099"
echo "   Firestore: http://localhost:8080"
echo "   UI: http://localhost:4000"
echo ""
echo "✨ Updated rules are now active. Try onboarding again!"
