#!/bin/bash

# Render Build Script for University Connect Backend

echo "🚀 Starting University Connect Backend Build..."

# Set Node.js version
echo "📋 Node.js version:"
node --version

echo "📋 NPM version:"
npm --version

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Remove existing node_modules and package-lock.json for a clean install
echo "🧹 Removing existing node_modules..."
rm -rf node_modules
rm -f package-lock.json

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create certificates directory
echo "📁 Creating certificates directory..."
mkdir -p certificates

echo "✅ Build completed successfully!"
