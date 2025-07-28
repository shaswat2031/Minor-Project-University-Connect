@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting University Connect Backend Build...

REM Display Node.js and npm versions
echo 📋 Node.js version:
node --version
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js.
    exit /b 1
)

echo 📋 NPM version:
npm --version
if errorlevel 1 (
    echo ❌ NPM not found. Please install npm.
    exit /b 1
)

REM Set npm configuration for better compatibility
echo 🔧 Setting npm configuration...
npm config set legacy-peer-deps true
npm config set fund false
npm config set audit false

REM Clear npm cache
echo 🧹 Clearing npm cache...
npm cache clean --force

REM Remove existing node_modules and package-lock.json for a clean install
echo 🧹 Removing existing node_modules...
if exist node_modules (
    rmdir /s /q node_modules
)
if exist package-lock.json (
    del package-lock.json
)

REM Install dependencies with retry logic
echo 📦 Installing dependencies...
npm install --no-optional --prefer-offline
if errorlevel 1 (
    echo ⚠️ First install failed, retrying with fresh cache...
    npm cache clean --force
    npm install --no-optional --no-shrinkwrap
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        exit /b 1
    )
)

REM Verify critical packages are properly installed
echo 🔍 Verifying critical packages...

if not exist "node_modules\bcryptjs" (
    echo ⚠️ bcryptjs not found, installing individually...
    npm install bcryptjs@^2.4.3 --force
)

if not exist "node_modules\mongoose" (
    echo ⚠️ mongoose not found, installing individually...
    npm install mongoose@^8.0.0 --force
)

REM Create certificates directory
echo 📁 Creating certificates directory...
if not exist certificates (
    mkdir certificates
)

REM Test if the main modules can be required
echo 🧪 Testing module imports...
echo try { require('bcryptjs'); console.log('✅ bcryptjs import successful'); } catch (e) { console.error('❌ bcryptjs import failed:', e.message); process.exit(1); } try { require('mongoose'); console.log('✅ mongoose import successful'); } catch (e) { console.error('❌ mongoose import failed:', e.message); process.exit(1); } | node

if errorlevel 1 (
    echo ❌ Module import test failed
    exit /b 1
)

echo ✅ Build completed successfully!
exit /b 0
