#!/bin/bash

# Render Build Script for University Connect Backend

echo "🚀 Starting University Connect Backend Build..."

# Set Node.js version
echo "📋 Node.js version:"
node --version

echo "📋 NPM version:"
npm --version

# Set npm configuration for better compatibility
echo "🔧 Setting npm configuration..."
npm config set legacy-peer-deps true
npm config set fund false
npm config set audit false

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Remove existing node_modules and package-lock.json for a clean install
echo "🧹 Removing existing node_modules..."
rm -rf node_modules
rm -f package-lock.json

# Install dependencies with retry logic
echo "📦 Installing dependencies..."
npm install --no-optional --prefer-offline || {
    echo "⚠️ First install failed, retrying with fresh cache..."
    npm cache clean --force
    npm install --no-optional --no-shrinkwrap
}

# Verify critical packages are properly installed
echo "🔍 Verifying critical packages..."
if [ ! -d "node_modules/bcryptjs" ]; then
    echo "⚠️ bcryptjs not found, installing individually..."
    npm install bcryptjs@^2.4.3 --force
fi

if [ ! -d "node_modules/mongoose" ]; then
    echo "⚠️ mongoose not found, installing individually..."
    npm install mongoose@^8.0.0 --force
fi

# Create certificates directory
echo "📁 Creating certificates directory..."
mkdir -p certificates

# Test if the main modules can be required
echo "🧪 Testing module imports..."
node -e "
try {
  require('bcryptjs');
  console.log('✅ bcryptjs import successful');
} catch (e) {
  console.error('❌ bcryptjs import failed:', e.message);
  process.exit(1);
}

try {
  require('mongoose');
  console.log('✅ mongoose import successful');
} catch (e) {
  console.error('❌ mongoose import failed:', e.message);
  process.exit(1);
}
"

echo "✅ Build completed successfully!"
